import { useRef, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from "@mui/material";

import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";

import axios from "axios";
import jwt_decode from "jwt-decode";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import UserCred from "../../../modal/userCred";
import { Company } from "../../../modal/Company";
import { Customer } from "../../../modal/Customer";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import notify from "../../../util/notify";

import {
    setUserId,
    setUserName,
    updateToken,
    userLogin,
    userLogout
} from "../../../redux/authState";

import { downloadSingleCompany } from "../../../redux/companyState";
import { downloadSingleCustomer } from "../../../redux/customerState";

type UserRole = "ADMIN" | "COMPANY" | "CUSTOMER";
type LoginStage = "authentication" | "profile";

interface LoginClaims {
    userType?: string;
    exp?: number;
}

function getLoginErrorMessage(
    error: unknown,
    stage: LoginStage
): string {
    if (
        error instanceof Error &&
        error.message === "INVALID_LOGIN_TOKEN"
    ) {
        return "השרת החזיר טוקן התחברות לא תקין. נסה שוב.";
    }

    if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (
            stage === "authentication" &&
            (status === 400 || status === 401 || status === 403)
        ) {
            return "האימייל, הסיסמה או סוג המשתמש שגויים.";
        }

        if (
            !error.response ||
            status === 502 ||
            status === 503 ||
            status === 504
        ) {
            return "לא ניתן להתחבר לשרת כרגע. ייתכן ששרת הדמו מתעורר משינה. המתן מעט ונסה שוב.";
        }
    }

    if (stage === "profile") {
        return "ההתחברות אומתה, אבל לא הצלחנו לטעון את פרטי החשבון. נסה להתחבר שוב.";
    }

    return "ההתחברות נכשלה. נסה שוב בעוד רגע.";
}

function getValidatedToken(
    authorization: unknown,
    expectedRole: UserRole
): string {
    if (
        typeof authorization !== "string" ||
        !authorization.startsWith("Bearer ")
    ) {
        throw new Error("INVALID_LOGIN_TOKEN");
    }

    const rawToken = authorization.substring(7).trim();

    try {
        const claims = jwt_decode<LoginClaims>(rawToken);
        const currentTime = Math.floor(Date.now() / 1000);

        if (
            claims.userType !== expectedRole ||
            typeof claims.exp !== "number" ||
            claims.exp <= currentTime
        ) {
            throw new Error("INVALID_LOGIN_TOKEN");
        }
    } catch {
        throw new Error("INVALID_LOGIN_TOKEN");
    }

    return authorization;
}

function Login(): JSX.Element {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<UserCred>();

    const [userType, setUserType] = useState<UserRole | "">("");
    const [selectedDemoRole, setSelectedDemoRole] =
        useState<UserRole | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const submissionInProgress = useRef(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const fillDemoCredentials = (role: UserRole) => {
        if (submissionInProgress.current) {
            return;
        }

        setUserType(role);
        setSelectedDemoRole(role);
        setErrorMessage("");

        switch (role) {
            case "ADMIN":
                setValue("email", "admin@admin.com");
                setValue("password", "admin");
                break;

            case "COMPANY":
                setValue("email", "sony@contact.com");
                setValue("password", "1234");
                break;

            case "CUSTOMER":
                setValue("email", "kobi@gmail.com");
                setValue("password", "1234");
                break;
        }
    };

    const send = async (data: UserCred): Promise<void> => {
        if (submissionInProgress.current) {
            return;
        }

        if (!userType) {
            setErrorMessage("יש לבחור סוג משתמש.");
            return;
        }

        submissionInProgress.current = true;
        setIsLoading(true);
        setErrorMessage("");

        const previousToken = sessionStorage.getItem("token");
        let receivedLoginResponse = false;
        let stage: LoginStage = "authentication";

        try {
            const response = await jwtAxios.post(globals.urls.login, {
                email: data.email.trim(),
                password: data.password,
                userType
            });

            receivedLoginResponse = true;

            const token = getValidatedToken(
                response.headers?.authorization ||
                    response.headers?.Authorization,
                userType
            );

            // Profile requests need the newly issued token.
            // Commit the Redux identity only after they succeed.
            sessionStorage.setItem("token", token);

            let company: Company | null = null;
            let customer: Customer | null = null;

            if (userType === "COMPANY") {
                stage = "profile";

                const profileResponse = await jwtAxios.get<Company>(
                    globals.company.getCompanyDetails
                );

                company = profileResponse.data;

                if (
                    !company ||
                    typeof company.id !== "number" ||
                    company.id <= 0 ||
                    !company.name
                ) {
                    throw new Error("INVALID_COMPANY_PROFILE");
                }
            }

            if (userType === "CUSTOMER") {
                stage = "profile";

                const profileResponse = await jwtAxios.get<Customer>(
                    globals.customer.getCustomerDetails
                );

                customer = profileResponse.data;

                if (
                    !customer ||
                    typeof customer.id !== "number" ||
                    customer.id <= 0 ||
                    !customer.first_name
                ) {
                    throw new Error("INVALID_CUSTOMER_PROFILE");
                }
            }

            // A profile request may refresh the JWT through JWTaxios.
            const activeToken = sessionStorage.getItem("token") || token;

            sessionStorage.removeItem("userName");
            sessionStorage.removeItem("userId");

            dispatch(userLogin(activeToken));
            dispatch(downloadSingleCompany([]));
            dispatch(downloadSingleCustomer([]));

            if (userType === "ADMIN") {
                dispatch(setUserName("Admin"));
                dispatch(setUserId(0));
                navigate("/");
                return;
            }

            if (userType === "COMPANY" && company) {
                dispatch(downloadSingleCompany([company]));
                dispatch(setUserName(company.name));
                dispatch(setUserId(company.id!));

                notify.success(`Welcome, ${company.name} company`);
                navigate("/company/allCoupons");
                return;
            }

            if (userType === "CUSTOMER" && customer) {
                dispatch(downloadSingleCustomer([customer]));
                dispatch(setUserName(customer.first_name));
                dispatch(setUserId(customer.id!));

                notify.success(`Welcome, ${customer.first_name}`);
                navigate("/");
            }
        } catch (error) {
            if (receivedLoginResponse) {
                // Restore the previous session if the new login fails
                // after receiving a token or during profile loading.
                if (previousToken) {
                    sessionStorage.setItem("token", previousToken);
                    dispatch(updateToken(previousToken));
                } else {
                    sessionStorage.removeItem("token");
                    dispatch(userLogout());
                }
            }

            setErrorMessage(getLoginErrorMessage(error, stage));
        } finally {
            submissionInProgress.current = false;
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
                        <LoginRoundedIcon sx={{ fontSize: 32 }} />
                    </Box>

                    <Typography
                        component="h1"
                        variant="h5"
                        sx={{ fontWeight: 800, mb: 0.75 }}
                    >
                        כניסה למערכת
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.8 }}
                    >
                        התחבר לחשבון שלך והמשך לניהול הקופונים וההטבות.
                    </Typography>
                </Box>

                <Box
                    sx={{
                        mb: 3,
                        p: 2,
                        bgcolor: "#F7F9FD",
                        borderRadius: 2.5,
                        border: "1px solid",
                        borderColor: "divider"
                    }}
                >
                    <Typography
                        variant="body2"
                        align="center"
                        sx={{
                            mb: 1.5,
                            fontWeight: 700,
                            color: "text.secondary"
                        }}
                    >
                        כניסה מהירה להדגמה
                    </Typography>

                    <Grid container spacing={1}>
                        <Grid item xs={4}>
                            <Button
                                variant={
                                    selectedDemoRole === "ADMIN"
                                        ? "contained"
                                        : "outlined"
                                }
                                fullWidth
                                size="small"
                                disabled={isLoading}
                                startIcon={<AdminPanelSettingsIcon />}
                                aria-pressed={selectedDemoRole === "ADMIN"}
                                onClick={() => fillDemoCredentials("ADMIN")}
                                sx={{ px: 1 }}
                            >
                                אדמין
                            </Button>
                        </Grid>

                        <Grid item xs={4}>
                            <Button
                                variant={
                                    selectedDemoRole === "COMPANY"
                                        ? "contained"
                                        : "outlined"
                                }
                                fullWidth
                                size="small"
                                disabled={isLoading}
                                startIcon={<BusinessIcon />}
                                aria-pressed={selectedDemoRole === "COMPANY"}
                                onClick={() => fillDemoCredentials("COMPANY")}
                                sx={{ px: 1 }}
                            >
                                חברה
                            </Button>
                        </Grid>

                        <Grid item xs={4}>
                            <Button
                                variant={
                                    selectedDemoRole === "CUSTOMER"
                                        ? "contained"
                                        : "outlined"
                                }
                                fullWidth
                                size="small"
                                disabled={isLoading}
                                startIcon={<PersonIcon />}
                                aria-pressed={selectedDemoRole === "CUSTOMER"}
                                onClick={() => fillDemoCredentials("CUSTOMER")}
                                sx={{ px: 1 }}
                            >
                                לקוח
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                {errorMessage && (
                    <Alert severity="error" role="alert" sx={{ mb: 3 }}>
                        {errorMessage}
                    </Alert>
                )}

                <Box
                    component="form"
                    onSubmit={handleSubmit(send)}
                    noValidate
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2.5
                        }}
                    >
                        <TextField
                            label="מייל"
                            type="email"
                            fullWidth
                            autoComplete="email"
                            InputLabelProps={{ shrink: true }}
                            disabled={isLoading}
                            inputProps={{
                                dir: "ltr",
                                style: { textAlign: "right" }
                            }}
                            error={Boolean(errors.email)}
                            helperText={errors.email?.message}
                            {...register("email", {
                                required: "יש להזין כתובת אימייל.",
                                onChange: () => setSelectedDemoRole(null)
                            })}
                        />

                        <TextField
                            label="סיסמה"
                            type="password"
                            fullWidth
                            autoComplete="current-password"
                            InputLabelProps={{ shrink: true }}
                            disabled={isLoading}
                            error={Boolean(errors.password)}
                            helperText={errors.password?.message}
                            {...register("password", {
                                required: "יש להזין סיסמה.",
                                onChange: () => setSelectedDemoRole(null)
                            })}
                        />

                        <FormControl fullWidth>
                            <InputLabel id="login-role-label">
                                סוג משתמש
                            </InputLabel>

                            <Select
                                labelId="login-role-label"
                                value={userType}
                                disabled={isLoading}
                                onChange={event => {
                                    setUserType(
                                        event.target.value as UserRole
                                    );
                                    setSelectedDemoRole(null);
                                    setErrorMessage("");
                                }}
                                label="סוג משתמש"
                            >
                                <MenuItem value="" disabled>
                                    בחר סוג משתמש
                                </MenuItem>
                                <MenuItem value="ADMIN">
                                    מנהל מערכת
                                </MenuItem>
                                <MenuItem value="COMPANY">
                                    חברה
                                </MenuItem>
                                <MenuItem value="CUSTOMER">
                                    לקוח
                                </MenuItem>
                            </Select>

                            <FormHelperText>
                                אפשר לבחור חשבון הדגמה למעלה או להזין פרטים אישיים.
                            </FormHelperText>
                        </FormControl>

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={isLoading}
                            aria-busy={isLoading}
                            sx={{
                                mt: 0.5,
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
                                    מתחבר...
                                </Box>
                            ) : (
                                "התחבר"
                            )}
                        </Button>
                    </Box>

                    <Typography
                        variant="caption"
                        display="block"
                        align="center"
                        color="text.secondary"
                        sx={{ mt: 2, lineHeight: 1.8 }}
                    >
                        שרת ההדגמה עשוי להזדקק למספר רגעים כדי להתעורר.
                    </Typography>

                    <Box
                        sx={{
                            mt: 3,
                            pt: 2,
                            textAlign: "center",
                            borderTop: "1px solid",
                            borderColor: "divider"
                        }}
                    >
                        <Button
                            disabled={isLoading}
                            onClick={() => navigate("/register")}
                            sx={{ color: "text.secondary" }}
                        >
                            אין לך חשבון? לחץ כאן להרשמה
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}

export default Login;