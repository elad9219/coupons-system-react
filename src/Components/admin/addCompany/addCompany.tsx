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

import AddBusinessRoundedIcon from "@mui/icons-material/AddBusinessRounded";

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
        <Container
            maxWidth="sm"
            dir="rtl"
            sx={{
                mt: { xs: 2, md: 4 },
                mb: 6,
                px: { xs: 1, sm: 2 }
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2.5, sm: 4 },
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 16px 44px rgba(20,38,61,0.07)"
                }}
            >
                <Box
                    sx={{
                        textAlign: "center",
                        mb: 3.5
                    }}
                >
                    <Box
                        sx={{
                            mx: "auto",
                            mb: 2,
                            width: 64,
                            height: 64,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: 3,
                            bgcolor: "primary.light",
                            color: "primary.main"
                        }}
                    >
                        <AddBusinessRoundedIcon
                            sx={{ fontSize: 32 }}
                        />
                    </Box>

                    <Typography
                        component="h1"
                        variant="h5"
                        sx={{
                            fontWeight: 800,
                            color: "text.primary",
                            mb: 0.75
                        }}
                    >
                        הוספת חברה חדשה
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            lineHeight: 1.8
                        }}
                    >
                        צור חשבון חברה לניהול ופרסום קופונים במערכת.
                    </Typography>
                </Box>

                {errorMessage && (
                    <Alert
                        severity="error"
                        role="alert"
                        sx={{ mb: 3 }}
                    >
                        {errorMessage}
                    </Alert>
                )}

                <Box
                    component="form"
                    onSubmit={handleSubmit(send)}
                    noValidate
                >
                    <Grid container spacing={2.5}>
                        <Grid item xs={12}>
                            <TextField
                                label="שם חברה"
                                fullWidth
                                disabled={isSubmitting}
                                error={Boolean(errors.name)}
                                helperText={errors.name?.message}
                                inputProps={{
                                    maxLength: 40
                                }}
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
                                disabled={isSubmitting}
                                error={Boolean(errors.email)}
                                helperText={errors.email?.message}
                                inputProps={{
                                    maxLength: 40,
                                    dir: "ltr",
                                    style: {
                                        textAlign: "right"
                                    }
                                }}
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
                                disabled={isSubmitting}
                                error={Boolean(errors.password)}
                                helperText={errors.password?.message}
                                autoComplete="new-password"
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
                                sx={{
                                    mt: 1,
                                    minHeight: 50,
                                    borderRadius: 2.5,
                                    fontSize: "1rem"
                                }}
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
                </Box>
            </Paper>
        </Container>
    );
}

export default AddCompany;