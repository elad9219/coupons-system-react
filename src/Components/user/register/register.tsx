import { useRef, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
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

import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";

import { Customer } from "../../../modal/Customer";
import jwtAxios from "../../../util/JWTaxios";
import notify from "../../../util/notify";
import globals from "../../../util/global";

function getRegistrationErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data: unknown = error.response?.data;

        if (
            status === 502 ||
            status === 503 ||
            status === 504 ||
            !error.response
        ) {
            return "לא ניתן להתחבר לשרת כרגע. נסה שוב בעוד רגע.";
        }

        let description: string | undefined;

        if (typeof data === "string") {
            description = data;
        } else if (
            data !== null &&
            typeof data === "object" &&
            !Array.isArray(data)
        ) {
            const errorData = data as Record<string, unknown>;

            if (typeof errorData.description === "string") {
                description = errorData.description;
            } else if (typeof errorData.message === "string") {
                description = errorData.message;
            }
        }

        if (
            description &&
            /email/i.test(description) &&
            /exist|already|registered|taken/i.test(description)
        ) {
            return "כתובת האימייל כבר רשומה במערכת.";
        }

        if (
            description &&
            description.trim() &&
            !/^\s*</.test(description)
        ) {
            return description;
        }
    }

    return "ההרשמה נכשלה. בדוק את הפרטים ונסה שוב.";
}

function Register(): JSX.Element {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<Customer>();

    const navigate = useNavigate();
    const sendingRef = useRef(false);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const send = async (data: Customer): Promise<void> => {
        if (sendingRef.current) {
            return;
        }

        sendingRef.current = true;
        setIsLoading(true);
        setErrorMessage("");

        try {
            await jwtAxios.post(
                globals.guest.register,
                {
                    first_name: data.first_name.trim(),
                    last_name: data.last_name.trim(),
                    email: data.email.trim(),
                    password: data.password
                }
            );

            notify.success(
                "ההרשמה הושלמה בהצלחה! אפשר להתחבר."
            );

            navigate("/login");
        } catch (error) {
            setErrorMessage(
                getRegistrationErrorMessage(error)
            );
        } finally {
            sendingRef.current = false;
            setIsLoading(false);
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
                <Box sx={{ textAlign: "center", mb: 3.5 }}>
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
                        <PersonAddAlt1RoundedIcon
                            sx={{ fontSize: 32 }}
                        />
                    </Box>

                    <Typography
                        component="h1"
                        variant="h5"
                        sx={{ fontWeight: 800, mb: 0.75 }}
                    >
                        הרשמה למערכת
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.8 }}
                    >
                        צור חשבון אישי וגלה את הקופונים וההטבות שלנו.
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
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="שם פרטי"
                                fullWidth
                                autoComplete="given-name"
                                disabled={isLoading}
                                error={Boolean(errors.first_name)}
                                helperText={errors.first_name?.message}
                                {...register("first_name", {
                                    required: "שדה חובה"
                                })}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="שם משפחה"
                                fullWidth
                                autoComplete="family-name"
                                disabled={isLoading}
                                error={Boolean(errors.last_name)}
                                helperText={errors.last_name?.message}
                                {...register("last_name", {
                                    required: "שדה חובה"
                                })}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="אימייל"
                                type="email"
                                fullWidth
                                autoComplete="email"
                                disabled={isLoading}
                                inputProps={{
                                    dir: "ltr",
                                    style: {
                                        textAlign: "right"
                                    }
                                }}
                                error={Boolean(errors.email)}
                                helperText={errors.email?.message}
                                {...register("email", {
                                    required: "שדה חובה"
                                })}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="סיסמה"
                                type="password"
                                fullWidth
                                autoComplete="new-password"
                                disabled={isLoading}
                                error={Boolean(errors.password)}
                                helperText={errors.password?.message}
                                {...register("password", {
                                    required: "שדה חובה",
                                    minLength: {
                                        value: 4,
                                        message: "מינימום 4 תווים"
                                    }
                                })}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={isLoading}
                                aria-busy={isLoading}
                                sx={{
                                    mt: 1,
                                    minHeight: 50,
                                    borderRadius: 2.5,
                                    fontSize: "1rem"
                                }}
                            >
                                {isLoading ? (
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
                                        נרשם...
                                    </Box>
                                ) : (
                                    "הירשם"
                                )}
                            </Button>
                        </Grid>
                    </Grid>

                    <Box
                        sx={{
                            mt: 3,
                            pt: 2,
                            borderTop: "1px solid",
                            borderColor: "divider",
                            textAlign: "center"
                        }}
                    >
                        <Button
                            onClick={() => navigate("/login")}
                            disabled={isLoading}
                            sx={{ color: "text.secondary" }}
                        >
                            כבר רשום? התחבר כאן
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}

export default Register;