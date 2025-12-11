import "./login.css";
import { Button, TextField, Typography, Select, InputLabel, MenuItem, FormControl, Paper, Container } from "@mui/material";
import { useForm } from "react-hook-form";
import { useState } from "react";
import notify from '../../../util/notify';
import globals from "../../../util/global";
import jwtAxios from '../../../util/JWTaxios';
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserName, userLogin } from "../../../redux/authState";
import { store } from "../../../redux/store";
import { downloadCompanies } from "../../../redux/companyState";
import { downloadCustomers } from "../../../redux/customerState";
import { downloadSingleCompany } from "../../../redux/companyState";
import { downloadSingleCustomer } from "../../../redux/customerState";
import { Company } from "../../../modal/Company";
import { Customer } from "../../../modal/Customer";

interface LoginForm {
    email: string;
    password: string;
}

function Login(): JSX.Element {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
    const [userType, setUserType] = useState("CUSTOMER");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeHandler = (event: any) => {
        setUserType(event.target.value);
    };

    const send = (data: LoginForm) => {
        const credentials = { ...data, userType };
        jwtAxios.post(globals.urls.login, credentials)
            .then(response => {
                const token = response.headers.authorization;
                localStorage.setItem('token', token);
                dispatch(userLogin(token));
                
                const currentUserType = store.getState().authState.userType;

                // Logic to fetch data AND set the real name in Redux
                if (currentUserType === "ADMIN") {
                    dispatch(setUserName("Admin")); // Admin usually doesn't have a first name field
                    jwtAxios.get<Company[]>(globals.admin.getAllCompanies)
                        .then(res => dispatch(downloadCompanies(res.data))).catch(() => {});
                    jwtAxios.get<Customer[]>(globals.admin.getAllCustomers)
                        .then(res => dispatch(downloadCustomers(res.data))).catch(() => {});
                    notify.success("ברוך הבא אדמין");
                    navigate("/");
                }

                if (currentUserType === "COMPANY") {
                    jwtAxios.get<Company>(globals.company.getCompanyDetails)
                        .then(res => {
                            dispatch(downloadSingleCompany([res.data]));
                            dispatch(setUserName(res.data.name)); // Set Company Name
                            notify.success(`ברוך הבא ${res.data.name}`);
                        })
                        .catch(() => {});
                    navigate("/company/allCoupons");
                }

                if (currentUserType === "CUSTOMER") {
                    jwtAxios.get<Customer>(globals.customer.getCustomerDetails)
                        .then(res => {
                            dispatch(downloadSingleCustomer([res.data]));
                            dispatch(setUserName(res.data.first_name)); // Set Customer First Name
                            notify.success(`ברוך הבא ${res.data.first_name}`);
                        })
                        .catch(() => {});
                    navigate("/");
                }
            })
            .catch(err => {
                notify.error("שגיאה בכניסה");
                console.log(err);
            });
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }} dir="rtl">
                <Typography variant="h4" align="center" gutterBottom sx={{fontWeight: 'bold', color: '#1976d2'}}>
                    כניסה למערכת
                </Typography>
                <form onSubmit={handleSubmit(send)}>
                    <TextField 
                        label="מייל" 
                        variant="outlined" 
                        fullWidth 
                        margin="normal"
                        {...register("email", { required: "חובה להזין מייל" })} 
                    />
                    {errors.email && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.email.message}</span>}

                    <TextField 
                        label="סיסמה" 
                        type="password" 
                        variant="outlined" 
                        fullWidth 
                        margin="normal"
                        {...register("password", { required: "חובה להזין סיסמה" })} 
                    />
                    {errors.password && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.password.message}</span>}

                    <FormControl fullWidth margin="normal">
                        <InputLabel>סוג משתמש</InputLabel>
                        <Select value={userType} onChange={changeHandler} label="סוג משתמש">
                            <MenuItem value="ADMIN">מנהל מערכת</MenuItem>
                            <MenuItem value="COMPANY">חברה</MenuItem>
                            <MenuItem value="CUSTOMER">לקוח</MenuItem>
                        </Select>
                    </FormControl>

                    <Button type="submit" variant="contained" color="primary" fullWidth size="large" sx={{ mt: 3, borderRadius: 2 }}>
                        התחבר
                    </Button>
                    
                    <Button 
                        variant="text" 
                        color="primary" 
                        fullWidth 
                        sx={{ mt: 1 }} 
                        onClick={() => navigate("/register")}
                    >
                        אין לך חשבון? הירשם כאן
                    </Button>
                </form>
            </Paper>
        </Container>
    );
}

export default Login;