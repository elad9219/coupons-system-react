import "./getAllCustomers.css";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from "../../../redux/store";
import { Customer } from "../../../modal/Customer";
import SingleCustomer from "../../customer/singleCustomer/singleCustomer";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import { Container, Grid, Typography, CircularProgress } from "@mui/material";
import advNotify from "../../../util/notify_advanced";

function GetAllCustomers(): JSX.Element {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (store.getState().authState.userType !== "ADMIN") {
            advNotify.error("Please login as Admin");
            navigate("/login");
            return;
        }
        
        jwtAxios.get<Customer[]>(globals.admin.getAllCustomers)
            .then(response => {
                setCustomers(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                setLoading(false);
            });
    }, [navigate]);

    const handleDelete = (id: number) => {
        setCustomers(customers.filter(c => c.id !== id));
    };

    const handleUpdate = (customer: Customer) => {
        navigate("/admin/updateCustomer", { state: { customerId: customer.id } });
    };

    if (loading) return <Container sx={{textAlign:'center', mt:5}}><CircularProgress/></Container>;

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
                ניהול לקוחות
            </Typography>
            <Grid container spacing={3}>
                {customers.map((customer) => (
                    <Grid item key={customer.id} xs={12} sm={6} md={4} lg={3}>
                        <SingleCustomer 
                            customer={customer} 
                            updateCustomer={() => handleUpdate(customer)} // Fix: pass function correctly
                            onDelete={handleDelete} // Fix: update UI immediately
                        />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}

export default GetAllCustomers;