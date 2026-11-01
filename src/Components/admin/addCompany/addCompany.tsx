
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

import { Company } from "../../../modal/Company";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import notify from "../../../util/notify";
import advNotify from "../../../util/notify_advanced";
import { getApiErrorMessage } from "../../../util/apiError";
import { store } from "../../../redux/store";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AddCompany(): JSX.Element {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<Company>();

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

    const send = async (data: Company): Promise<void> => {
        if (submittingRef.current) {
            return;
        }

        submittingRef.current = true;
        setIsSubmitting(true);
        setErrorMessage("");

        const company = {
            name: data.name.trim(),
            email: data.email.trim(),
            password: data.password
        };

        try {
            await jwtAxios.post(
                globals.admin.addCompany,
                company
            );

            notify.success(
                `חברה נוספה בהצלחה: ${company.name}`
            );

            navigate("/admin/getAllCompanies");
        } catch (error) {
            setErrorMessage(
                getApiErrorMessage(
                    error,
                    "לא הצלחנו להוסיף את החברה. בדוק את הפרטים ונסה שוב."
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
                    הוספת חברה חדשה
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
                        <Grid item xs={12}>
                            <TextField
                                label="שם חברה"
                                fullWidth
                                size="small"
                                disabled={isSubmitting}
                                error={Boolean(errors.name)}
                                helperText={errors.name?.message}
                                inputProps={{ maxLength: 40 }}
                                {...register("name", {
                                    required: "יש להזין שם חברה.",
                                    validate: value =>
                                        Boolean(value?.trim()) ||
                                        "יש להזין שם חברה.",
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
                                        מוסיף חברה...
                                    </Box>
                                ) : (
                                    "הוסף חברה"
                                )}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
}

export default AddCompany;
