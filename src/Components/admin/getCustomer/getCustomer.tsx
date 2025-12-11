import { Button, TextField, Container, Paper, Typography, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Customer } from "../../../modal/Customer";
import { store } from "../../../redux/store";
import globals from "../../../util/global";
import jwtAxios from "../../../util/JWTaxios";
import notify from "../../../util/notify";
import advNotify from "../../../util/notify_advanced";
import SingleCustomer from "../../customer/singleCustomer/singleCustomer";

function GetCustomer(): JSX.Element {
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [customerId, setCustomerId] = useState(1); // Default ID 1

    useEffect(() => {
        if (store.getState().authState.userType!=="ADMIN") {
            advNotify.error("Access Denied");
            navigate("/login");
        }
    },[navigate]);

    const findCustomer = () => {
        if(customerId < 1) { notify.error("ID לא חוקי"); return; }
        
        jwtAxios.get(globals.admin.getOneCustomer + customerId)
            .then((response) => {
                setCustomer(response.data);
            })
            .catch(() => {
                notify.error("לקוח לא נמצא");
                setCustomer(null);
            });
    };

    const handleUpdate = () => {
        if (customer) navigate("/admin/updateCustomer", { state: { customerId: customer.id } });
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }} dir="rtl">
                <Typography variant="h5" align="center" gutterBottom fontWeight="bold" color="primary">
                    חיפוש לקוח
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField 
                        type="number" label="מזהה לקוח (ID)" fullWidth size="small"
                        value={customerId}
                        onChange={(e) => setCustomerId(+e.target.value)}
                        InputProps={{ inputProps: { min: 1 } }}
                    />
                    <Button variant="contained" onClick={findCustomer} sx={{ minWidth: 100 }}>חפש</Button>
                </Box>
                
                {customer && (
                    <SingleCustomer 
                        customer={customer} 
                        updateCustomer={handleUpdate} 
                        onDelete={() => setCustomer(null)}
                    />
                )}
            </Paper>
        </Container>
    );
}

export default GetCustomer;