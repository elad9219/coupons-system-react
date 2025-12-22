import "./login.css";
import { Button, TextField, Typography, Select, InputLabel, MenuItem, FormControl, Paper, Container, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { useState } from "react";
import notify from '../../../util/notify';
import globals from "../../../util/global";
import jwtAxios from '../../../util/JWTaxios';
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserId, setUserName, userLogin } from "../../../redux/authState";
import { store } from "../../../redux/store";
import { downloadCompanies } from "../../../redux/companyState";
import { downloadCustomers } from "../../../redux/customerState";
import { downloadSingleCompany } from "../../../redux/companyState";
import { downloadSingleCustomer } from "../../../redux/customerState";
import { Company } from "../../../modal/Company";
import { Customer } from "../../../modal/Customer";

function Login(): JSX.Element {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [userType, setUserType] = useState("CUSTOMER");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const send = (data: any) => {
        const credentials = { email: data.email, password: data.password, userType };
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
                            dispatch(setUserId(res.data.id || 0)); // Important for identification
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

    return (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }} dir="rtl">
                <Typography variant="h4" align="center" gutterBottom sx={{fontWeight: 'bold', color: '#1976d2'}}>כניסה למערכת</Typography>
                <form onSubmit={handleSubmit(send)}>
                    <TextField label="מייל" fullWidth margin="normal" {...register("email", { required: true })} />
                    <TextField label="סיסמה" type="password" fullWidth margin="normal" {...register("password", { required: true })} />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>סוג משתמש</InputLabel>
                        <Select value={userType} onChange={(e) => setUserType(e.target.value)} label="סוג משתמש">
                            <MenuItem value="ADMIN">מנהל מערכת</MenuItem>
                            <MenuItem value="COMPANY">חברה</MenuItem>
                            <MenuItem value="CUSTOMER">לקוח</MenuItem>
                        </Select>
                    </FormControl>
                    <Button type="submit" variant="contained" color="primary" fullWidth size="large" sx={{ mt: 3 }}>התחבר</Button>
                </form>
            </Paper>
        </Container>
    );
}
export default Login;