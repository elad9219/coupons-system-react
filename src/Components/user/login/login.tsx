import "./login.css";
import { Button, TextField, Typography, Select, InputLabel, MenuItem, FormControl, Paper, Container, Box, Divider, Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import { useState } from "react";
import notify from '../../../util/notify';
import globals from "../../../util/global";
import jwtAxios from '../../../util/JWTaxios';
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserId, setUserName, userLogin } from "../../../redux/authState";
import { store } from "../../../redux/store";
import { downloadSingleCompany } from "../../../redux/companyState";
import { downloadSingleCustomer } from "../../../redux/customerState";
import { Company } from "../../../modal/Company";
import { Customer } from "../../../modal/Customer";
import UserCred from "../../../modal/userCred";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';

function Login(): JSX.Element {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm<UserCred>();
    const [userType, setUserType] = useState("CUSTOMER");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const send = (data: UserCred) => {
        const credentials = { email: data.email, password: data.password, userType: userType };
        jwtAxios.post(globals.urls.login, credentials)
            .then(response => {
                const token = response.headers.authorization;
                localStorage.setItem('token', token);
                dispatch(userLogin(token));

                const currentUserType = store.getState().authState.userType;

                if (currentUserType === "ADMIN") {
                    dispatch(setUserName("Admin"));
                    navigate("/");
                }

                if (currentUserType === "COMPANY") {
                    jwtAxios.get<Company>(globals.company.getCompanyDetails)
                        .then(res => {
                            dispatch(downloadSingleCompany([res.data]));
                            dispatch(setUserName(res.data.name));
                            dispatch(setUserId(res.data.id || 0));
                            notify.success(`ברוך הבא, חברת ${res.data.name}`);
                            navigate("/company/allCoupons");
                        });
                }

                if (currentUserType === "CUSTOMER") {
                    jwtAxios.get<Customer>(globals.customer.getCustomerDetails)
                        .then(res => {
                            dispatch(downloadSingleCustomer([res.data]));
                            dispatch(setUserName(res.data.first_name));
                            dispatch(setUserId(res.data.id || 0));
                            notify.success(`ברוך הבא, ${res.data.first_name}`);
                            navigate("/");
                        });
                }
            })
            .catch(err => {
                notify.error("פרטי התחברות שגויים");
            });
    };

    // Helper function to fill demo credentials
    const fillDemoCredentials = (type: string) => {
        setUserType(type);
        switch (type) {
            case "ADMIN":
                setValue("email", "admin@admin.com");
                setValue("password", "admin");
                break;
            case "COMPANY":
                // Updated to match the Backend DataSeeding logic (sony@contact.com)
                setValue("email", "sony@contact.com"); 
                setValue("password", "1234");
                break;
            case "CUSTOMER":
                // Updated to match the Backend DataSeeding logic (kobi@gmail.com)
                setValue("email", "kobi@gmail.com");
                setValue("password", "1234");
                break;
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }} dir="rtl">
                <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    כניסה למערכת
                </Typography>

                {/* Demo Area - Prominent and Clear */}
                <Box sx={{ mb: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 2, border: '1px solid #90caf9' }}>
                    <Typography variant="subtitle2" color="primary" align="center" sx={{ mb: 1, fontWeight: 'bold' }}>
                        כניסה מהירה להדגמה
                    </Typography>
                    <Grid container spacing={1} justifyContent="center">
                        <Grid item>
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<AdminPanelSettingsIcon />}
                                onClick={() => fillDemoCredentials("ADMIN")}
                                sx={{ borderRadius: 20, textTransform: 'none' }}
                            >
                                אדמין
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="outlined"
                                color="info"
                                size="small"
                                startIcon={<BusinessIcon />}
                                onClick={() => fillDemoCredentials("COMPANY")}
                                sx={{ borderRadius: 20, textTransform: 'none' }}
                            >
                                חברה
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="outlined"
                                color="success"
                                size="small"
                                startIcon={<PersonIcon />}
                                onClick={() => fillDemoCredentials("CUSTOMER")}
                                sx={{ borderRadius: 20, textTransform: 'none' }}
                            >
                                לקוח
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <form onSubmit={handleSubmit(send)}>
                    <TextField
                        label="מייל"
                        fullWidth
                        margin="normal"
                        {...register("email", { required: true })}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="סיסמה"
                        type="password"
                        fullWidth
                        margin="normal"
                        {...register("password", { required: true })}
                        InputLabelProps={{ shrink: true }}
                    />

                    <FormControl fullWidth margin="normal">
                        <InputLabel>סוג משתמש</InputLabel>
                        <Select
                            value={userType}
                            onChange={(e) => setUserType(e.target.value)}
                            label="סוג משתמש"
                        >
                            <MenuItem value="ADMIN">מנהל מערכת</MenuItem>
                            <MenuItem value="COMPANY">חברה</MenuItem>
                            <MenuItem value="CUSTOMER">לקוח</MenuItem>
                        </Select>
                    </FormControl>

                    <Button type="submit" variant="contained" color="primary" fullWidth size="large" sx={{ mt: 3, fontWeight: 'bold' }}>
                        התחבר
                    </Button>

                    {/* Registration button restored */}
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Button
                            onClick={() => navigate("/register")}
                            color="secondary"
                            sx={{ textTransform: 'none' }}
                        >
                            אין לך חשבון? לחץ כאן להרשמה
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
}

export default Login;