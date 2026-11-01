
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Grid,
    Paper,
    TextField,
    Typography
} from "@mui/material";

import { Customer } from "../../../modal/Customer";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import notify from "../../../util/notify";
import advNotify from "../../../util/notify_advanced";
import { getApiErrorMessage } from "../../../util/apiError";
import { store } from "../../../redux/store";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AddCustomer(): JSX.Element {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<Customer>();

    const navigate = useNavigate();
    const submittingRef = useRef(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (store.getState().authState.userType !== "ADMIN") {
            advNotify.error("יש להתחבר כמנהל מערכת");
            navigate("/login");
        }
    }, [navigate]);

    const send = async (data: Customer): Promise<void> => {
        if (submittingRef.current) {
            return;
        }

        submittingRef.current = true;
        setIsSubmitting(true);
        setErrorMessage("");

        const customer = {
            first_name: data.first_name.trim(),
            last_name: data.last_name.trim(),
            email: data.email.trim(),
            password: data.password
        };

        try {
            await jwtAxios.post(
                globals.admin.addCustomer,
                customer
            );

            notify.success(
                `לקוח נוסף בהצלחה: ${customer.first_name}`
            );

            navigate("/admin/getAllCustomers");
        } catch (error) {
            setErrorMessage(
                getApiErrorMessage(
                    error,
                    "לא הצלחנו להוסיף את הלקוח. בדוק את הפרטים ונסה שוב."
                )
            );
        } finally {
            submittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Paper
                elevation={3}
                sx={{ p: 4, borderRadius: 2 }}
                dir="rtl"
            >
                <Typography
                    variant="h5"
                    align="center"
                    gutterBottom
                    fontWeight="bold"
                    color="primary"
                >
                    הוספת לקוח חדש
                </Typography>

                {errorMessage && (
                    <Alert
                        severity="error"
                        role="alert"
                        sx={{ mb: 3 }}
                    >
                        {errorMessage}
                    </Alert>
                )}

                <form onSubmit={handleSubmit(send)} noValidate>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="שם פרטי"
                                fullWidth
                                size="small"
                                disabled={isSubmitting}
                                error={Boolean(errors.first_name)}
                                helperText={errors.first_name?.message}
                                inputProps={{ maxLength: 40 }}
                                {...register("first_name", {
                                    required: "יש להזין שם פרטי.",
                                    validate: value =>
                                        Boolean(value?.trim()) ||
                                        "יש להזין שם פרטי.",
                                    maxLength: {
                                        value: 40,
                                        message: "עד 40 תווים."
                                    }
                                })}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="שם משפחה"
                                fullWidth
                                size="small"
                                disabled={isSubmitting}
                                error={Boolean(errors.last_name)}
                                helperText={errors.last_name?.message}
                                inputProps={{ maxLength: 40 }}
                                {...register("last_name", {
                                    required: "יש להזין שם משפחה.",
                                    validate: value =>
                                        Boolean(value?.trim()) ||
                                        "יש להזין שם משפחה.",
                                    maxLength: {
                                        value: 40,
                                        message: "עד 40 תווים."
                                    }
                                })}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="אימייל"
                                type="email"
                                fullWidth
                                size="small"
                                disabled={isSubmitting}
                                error={Boolean(errors.email)}
                                helperText={errors.email?.message}
                                inputProps={{ maxLength: 40 }}
                                {...register("email", {
                                    required: "יש להזין אימייל.",
                                    maxLength: {
                                        value: 40,
                                        message: "עד 40 תווים."
                                    },
                                    pattern: {
                                        value: emailPattern,
                                        message: "כתובת אימייל לא תקינה."
                                    }
                                })}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="סיסמה"
                                type="password"
                                fullWidth
                                size="small"
                                disabled={isSubmitting}
                                error={Boolean(errors.password)}
                                helperText={errors.password?.message}
                                {...register("password", {
                                    required: "יש להזין סיסמה.",
                                    minLength: {
                                        value: 4,
                                        message: "לפחות 4 תווים."
                                    }
                                })}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                disabled={isSubmitting}
                                aria-busy={isSubmitting}
                                sx={{ mt: 1 }}
                            >
                                {isSubmitting ? (
                                    <Box
                                        component="span"
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1
                                        }}
                                    >
                                        <CircularProgress
                                            size={20}
                                            color="inherit"
                                        />
                                        מוסיף לקוח...
                                    </Box>
                                ) : (
                                    "הוסף לקוח"
                                )}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
}

export default AddCustomer;
