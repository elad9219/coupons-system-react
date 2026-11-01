
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
    Paper,
    TextField,
    Typography
} from "@mui/material";

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
        <Container maxWidth="sm" sx={{ mt: 8, mb: 6 }}>
            <Paper
                elevation={3}
                sx={{ p: 4, borderRadius: 2 }}
                dir="rtl"
            >
                <Typography
                    variant="h4"
                    align="center"
                    gutterBottom
                    sx={{
                        fontWeight: "bold",
                        color: "#1976d2"
                    }}
                >
                    הרשמה למערכת
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

                <form
                    onSubmit={handleSubmit(send)}
                    noValidate
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2
                        }}
                    >
                        <TextField
                            label="שם פרטי"
                            fullWidth
                            disabled={isLoading}
                            error={Boolean(errors.first_name)}
                            helperText={errors.first_name?.message}
                            {...register("first_name", {
                                required: "שדה חובה"
                            })}
                        />

                        <TextField
                            label="שם משפחה"
                            fullWidth
                            disabled={isLoading}
                            error={Boolean(errors.last_name)}
                            helperText={errors.last_name?.message}
                            {...register("last_name", {
                                required: "שדה חובה"
                            })}
                        />

                        <TextField
                            label="אימייל"
                            type="email"
                            fullWidth
                            disabled={isLoading}
                            error={Boolean(errors.email)}
                            helperText={errors.email?.message}
                            {...register("email", {
                                required: "שדה חובה"
                            })}
                        />

                        <TextField
                            label="סיסמה"
                            type="password"
                            fullWidth
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

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            disabled={isLoading}
                            aria-busy={isLoading}
                            sx={{ mt: 2 }}
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

                        <Button
                            onClick={() => navigate("/login")}
                            disabled={isLoading}
                            color="secondary"
                            sx={{ textTransform: "none" }}
                        >
                            כבר רשום? התחבר כאן
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
}

export default Register;
