import { TextField, Button, Container, Paper, Typography, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Customer } from "../../../modal/Customer";
import jwtAxios from '../../../util/JWTaxios';
import globals from "../../../util/global";
import notify from "../../../util/notify";
import LoadingSpinner from "../../common/LoadingSpinner/LoadingSpinner";

function UpdateCustomer(): JSX.Element {
    const location = useLocation();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const customerId = (location.state as any)?.customerId;

    useEffect(() => {
        if (!customerId) { navigate("/admin/getAllCustomers"); return; }

        jwtAxios.get(globals.admin.getOneCustomer + customerId)
            .then(response => setCustomer(response.data))
            .catch(() => notify.error("שגיאה בטעינת לקוח"));
    }, [customerId, navigate]);

    const handleSave = () => {
        if (!customer) return;
        jwtAxios.put(globals.admin.updateCustomer, customer)
            .then(() => {
                notify.success("לקוח עודכן בהצלחה");
                navigate("/admin/getAllCustomers");
            })
            .catch(() => notify.error("שגיאה בעדכון"));
    };

    if (!customer) return <LoadingSpinner />;

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }} dir="rtl">
                <Typography variant="h5" align="center" gutterBottom fontWeight="bold" color="primary">
                    עדכון פרטי לקוח
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField label="שם פרטי" fullWidth size="small" value={customer.first_name} onChange={e => setCustomer({...customer, first_name: e.target.value})} />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField label="שם משפחה" fullWidth size="small" value={customer.last_name} onChange={e => setCustomer({...customer, last_name: e.target.value})} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField label="אימייל" fullWidth size="small" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField label="סיסמה" fullWidth size="small" value={customer.password} onChange={e => setCustomer({...customer, password: e.target.value})} />
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="contained" fullWidth onClick={handleSave}>שמור שינויים</Button>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}

export default UpdateCustomer;