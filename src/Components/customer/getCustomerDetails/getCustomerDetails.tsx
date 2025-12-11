import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { store } from "../../../redux/store";
import { Customer } from '../../../modal/Customer';
import { Container, Paper, Typography, Box, TextField, Button, InputAdornment, IconButton } from "@mui/material";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import notify from "../../../util/notify";
import LoadingSpinner from "../../common/LoadingSpinner/LoadingSpinner";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function GetCustomerDetails(): JSX.Element {
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        jwtAxios.get<Customer>(globals.customer.getCustomerDetails)
            .then(res => {
                setCustomer(res.data);
                setLoading(false);
            })
            .catch(() => {
                navigate("/login");
            });
    }, [navigate]);

    const handleSave = () => {
        if (!customer) return;
        // Reuse the admin update endpoint as user is authorized to update themselves often via same logic,
        // or ensure you have a specific customer update endpoint.
        // Assuming admin endpoint works if logic allows, otherwise use customer specific.
        // If this fails 403/401, you MUST add updateCustomer to CustomerController in backend.
        jwtAxios.put(globals.admin.updateCustomer, customer) 
            .then(() => {
                notify.success("פרטים עודכנו בהצלחה");
                setEditMode(false);
            })
            .catch((err) => {
                notify.error("שגיאה בעדכון פרטים");
            });
    };

    if (loading) return <LoadingSpinner />;
    if (!customer) return <div>שגיאה בטעינת נתונים</div>;

    return (
        <Container maxWidth="xs" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }} dir="rtl">
                <Typography variant="h5" gutterBottom align="center" fontWeight="bold" color="primary">
                    הפרופיל שלי
                </Typography>
                
                <Box component="form" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField 
                        label="שם פרטי" size="small" value={customer.first_name} disabled={!editMode}
                        onChange={e => setCustomer({...customer, first_name: e.target.value})}
                    />
                    <TextField 
                        label="שם משפחה" size="small" value={customer.last_name} disabled={!editMode}
                        onChange={e => setCustomer({...customer, last_name: e.target.value})}
                    />
                    <TextField 
                        label="אימייל" size="small" value={customer.email} disabled={!editMode}
                        onChange={e => setCustomer({...customer, email: e.target.value})}
                    />
                    <TextField
                        label="סיסמה" size="small" type={showPassword ? 'text' : 'password'} value={customer.password} disabled={!editMode}
                        onChange={e => setCustomer({...customer, password: e.target.value})}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {editMode ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button variant="contained" onClick={handleSave} fullWidth>שמור</Button>
                            <Button variant="outlined" onClick={() => setEditMode(false)} fullWidth>ביטול</Button>
                        </Box>
                    ) : (
                        <Button variant="contained" onClick={() => setEditMode(true)} fullWidth>עדכון פרטים</Button>
                    )}
                </Box>
            </Paper>
        </Container>
    );
}

export default GetCustomerDetails;