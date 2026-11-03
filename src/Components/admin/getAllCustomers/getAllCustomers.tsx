
import "./getAllCustomers.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Grid,
    Typography
} from "@mui/material";

import { store } from "../../../redux/store";
import { Customer } from "../../../modal/Customer";
import SingleCustomer from "../../customer/singleCustomer/singleCustomer";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import advNotify from "../../../util/notify_advanced";

function GetAllCustomers(): JSX.Element {
    const navigate = useNavigate();

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        if (store.getState().authState.userType !== "ADMIN") {
            advNotify.error("יש להתחבר כמנהל מערכת");
            navigate("/login");
            return;
        }

        let active = true;

        const loadCustomers = async (): Promise<void> => {
            setLoading(true);
            setErrorMessage("");

            try {
                const response = await jwtAxios.get<Customer[]>(
                    globals.admin.getAllCustomers
                );

                if (!active) {
                    return;
                }

                if (!Array.isArray(response.data)) {
                    throw new Error("Invalid customers response");
                }

                setCustomers(response.data);
            } catch {
                if (!active) {
                    return;
                }

                setCustomers([]);
                setErrorMessage(
                    "לא הצלחנו לטעון את רשימת הלקוחות. נסה שוב."
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadCustomers();

        return () => {
            active = false;
        };
    }, [navigate, retryCount]);

    const handleDelete = (id: number): void => {
        setCustomers(previous =>
            previous.filter(customer => customer.id !== id)
        );
    };

    const handleUpdate = (customer: Customer): void => {
        navigate("/admin/updateCustomer", {
            state: { customerId: customer.id }
        });
    };

    return (
        <Container
            maxWidth="xl"
            sx={{ mt: 4, mb: 4 }}
            dir="rtl"
        >
            <Typography
                variant="h4"
                align="center"
                gutterBottom
                fontWeight="bold"
                color="primary"
            >
                ניהול לקוחות
            </Typography>

            {loading ? (
                <Box
                    role="status"
                    aria-label="טוען לקוחות"
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        py: 6
                    }}
                >
                    <CircularProgress />
                </Box>
            ) : errorMessage ? (
                <Alert
                    severity="error"
                    role="alert"
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={() =>
                                setRetryCount(previous => previous + 1)
                            }
                        >
                            נסה שוב
                        </Button>
                    }
                >
                    {errorMessage}
                </Alert>
            ) : customers.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 6 }}>
                    <Typography
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        אין לקוחות במערכת כרגע.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => navigate("/admin/addCustomer")}
                    >
                        הוסף לקוח
                    </Button>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {customers.map(customer => (
                        <Grid
                            item
                            key={customer.id}
                            xs={12}
                            sm={12}
                            md={6}
                            lg={4}
                        >
                            <SingleCustomer
                                customer={customer}
                                updateCustomer={() =>
                                    handleUpdate(customer)
                                }
                                onDelete={handleDelete}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}

export default GetAllCustomers;
