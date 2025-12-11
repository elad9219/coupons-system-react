import { Customer } from '../../../modal/Customer';
import { useNavigate } from "react-router-dom";
import { Button, TextField, Container, Paper, Typography, Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import jwtAxios from '../../../util/JWTaxios';
import globals from '../../../util/global';
import notify from '../../../util/notify';
import { store } from "../../../redux/store";
import { addCustomer } from "../../../redux/customerState";
import { useEffect } from "react";
import advNotify from "../../../util/notify_advanced";

function AddCustomer(): JSX.Element {
    const {register, handleSubmit, formState:{errors}} = useForm<Customer>();
    const navigate = useNavigate();

    useEffect(() => {
        if (store.getState().authState.userType!=="ADMIN") {
            advNotify.error("Access Denied");
            navigate("/login");
        }
    },[navigate]);

    const send = (newCustomer:Customer)=> {
        jwtAxios.post(globals.admin.addCustomer,newCustomer)
        .then(response => {
            notify.success("לקוח נוסף בהצלחה: " + newCustomer.first_name);
            store.dispatch(addCustomer(newCustomer));
            navigate("/admin/getAllCustomers");
        })
        .catch(err=> notify.error("שגיאה בהוספה"));
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }} dir="rtl">
                <Typography variant="h5" align="center" gutterBottom fontWeight="bold" color="primary">
                    הוספת לקוח חדש
                </Typography>
                <form onSubmit={handleSubmit(send)}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField 
                                label="שם פרטי" fullWidth size="small"
                                {...register("first_name",{ required: "שדה חובה" })}
                                error={!!errors.first_name} helperText={errors.first_name?.message}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField 
                                label="שם משפחה" fullWidth size="small"
                                {...register("last_name",{ required: "שדה חובה" })}
                                error={!!errors.last_name} helperText={errors.last_name?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                label="אימייל" type="email" fullWidth size="small"
                                {...register("email",{ required: "שדה חובה" })}
                                error={!!errors.email} helperText={errors.email?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                label="סיסמה" type="password" fullWidth size="small"
                                {...register("password",{ required: "שדה חובה" })}
                                error={!!errors.password} helperText={errors.password?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" fullWidth size="large" sx={{mt: 1}}>
                                הוסף לקוח
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
}

export default AddCustomer;