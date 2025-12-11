import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Customer } from "../../../modal/Customer";
import { TextField, Button, Typography, Container, Paper, Box } from "@mui/material";
import jwtAxios from "../../../util/JWTaxios";
import notify from "../../../util/notify";
import globals from "../../../util/global";

function Register(): JSX.Element {
    const { register, handleSubmit, formState: { errors } } = useForm<Customer>();
    const navigate = useNavigate();

    const send = async (data: Customer) => {
        try {
            // Send registration request to guest endpoint
            await jwtAxios.post(globals.guest.register, data);
            notify.success("Registration successful! Please login.");
            navigate("/login");
        } catch (err: any) {
            notify.error(err.response?.data || "Registration failed");
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" align="center" gutterBottom sx={{fontWeight: 'bold', color: '#1976d2'}}>
                    הרשמה למערכת
                </Typography>
                <form onSubmit={handleSubmit(send)}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField 
                            label="שם פרטי" 
                            fullWidth 
                            {...register("first_name", { required: "שדה חובה" })} 
                            error={!!errors.first_name} 
                            helperText={errors.first_name?.message} 
                        />
                        <TextField 
                            label="שם משפחה" 
                            fullWidth 
                            {...register("last_name", { required: "שדה חובה" })} 
                            error={!!errors.last_name} 
                            helperText={errors.last_name?.message} 
                        />
                        <TextField 
                            label="אימייל" 
                            type="email" 
                            fullWidth 
                            {...register("email", { required: "שדה חובה" })} 
                            error={!!errors.email} 
                            helperText={errors.email?.message} 
                        />
                        <TextField 
                            label="סיסמה" 
                            type="password" 
                            fullWidth 
                            {...register("password", { 
                                required: "שדה חובה", 
                                minLength: { value: 4, message: "מינימום 4 תווים" } 
                            })} 
                            error={!!errors.password} 
                            helperText={errors.password?.message} 
                        />
                        
                        <Button type="submit" variant="contained" size="large" fullWidth sx={{mt: 2}}>
                            הירשם
                        </Button>
                        <Button onClick={() => navigate("/login")} color="secondary" sx={{textTransform: 'none'}}>
                            כבר רשום? התחבר כאן
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
}

export default Register;