import { useNavigate } from "react-router-dom";
import { Company } from "../../../modal/Company";
import { Button, TextField, Container, Paper, Typography, Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import jwtAxios from '../../../util/JWTaxios';
import globals from '../../../util/global';
import notify from '../../../util/notify';
import { store } from "../../../redux/store";
import { addCompany } from '../../../redux/companyState';
import { useEffect } from "react";
import advNotify from "../../../util/notify_advanced";

function AddCompany(): JSX.Element {
    const {register, handleSubmit, formState:{errors}} = useForm<Company>();
    const navigate = useNavigate();

    useEffect(() => {
        if (store.getState().authState.userType!=="ADMIN") {
            advNotify.error("Access Denied");
            navigate("/login");
        }
    },[navigate]);

    const send = (newCompany:Company)=> {
        jwtAxios.post(globals.admin.addCompany,newCompany)
        .then(response => {
            notify.success("חברה נוספה בהצלחה: "+ newCompany.name);
            store.dispatch(addCompany(newCompany));
            navigate("/admin/getAllCompanies");
        })
        .catch(err=> notify.error("שגיאה בהוספה (אולי המייל תפוס?)"));
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }} dir="rtl">
                <Typography variant="h5" align="center" gutterBottom fontWeight="bold" color="primary">
                    הוספת חברה חדשה
                </Typography>
                <form onSubmit={handleSubmit(send)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField 
                                label="שם חברה" fullWidth size="small"
                                {...register("name",{ required: "שדה חובה" })}
                                error={!!errors.name} helperText={errors.name?.message}
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
                                הוסף חברה
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
}

export default AddCompany;