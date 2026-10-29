import { useRef, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from "@mui/material";
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

    const [userType, setUserType] = useState<UserRole>("CUSTOMER");
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
            // Do not commit the new Redux identity until they succeed.
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

            // Do not reuse account information from a previous login.
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
                // Restore the previous session if the new login failed
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
        <Container maxWidth="xs" sx={{ mt: 8, mb: 6 }}>
            <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }} dir="rtl">
                <Typography
                    variant="h4"
                    align="center"
                    gutterBottom
                    sx={{ fontWeight: "bold", color: "#1976d2" }}
                >
                    כניסה למערכת
                </Typography>

                <Box
                    sx={{
                        mb: 3,
                        p: 2,
                        bgcolor: "#e3f2fd",
                        borderRadius: 2,
                        border: "1px solid #90caf9"
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        color="primary"
                        align="center"
                        sx={{ mb: 1, fontWeight: "bold" }}
                    >
                        כניסה מהירה להדגמה
                    </Typography>

                    <Grid container spacing={1} justifyContent="center">
                        <Grid item>
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                disabled={isLoading}
                                startIcon={
                                    <AdminPanelSettingsIcon sx={{ ml: 1 }} />
                                }
                                onClick={() => fillDemoCredentials("ADMIN")}
                                sx={{
                                    borderRadius: 20,
                                    textTransform: "none"
                                }}
                            >
                                אדמין
                            </Button>
                        </Grid>

                        <Grid item>
                            <Button
                                variant="outlined"
                                color="info"
                                size="small"
                                disabled={isLoading}
                                startIcon={<BusinessIcon sx={{ ml: 1 }} />}
                                onClick={() => fillDemoCredentials("COMPANY")}
                                sx={{
                                    borderRadius: 20,
                                    textTransform: "none"
                                }}
                            >
                                חברה
                            </Button>
                        </Grid>

                        <Grid item>
                            <Button
                                variant="outlined"
                                color="success"
                                size="small"
                                disabled={isLoading}
                                startIcon={<PersonIcon sx={{ ml: 1 }} />}
                                onClick={() => fillDemoCredentials("CUSTOMER")}
                                sx={{
                                    borderRadius: 20,
                                    textTransform: "none"
                                }}
                            >
                                לקוח
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {errorMessage && (
                    <Alert
                        severity="error"
                        role="alert"
                        sx={{ mb: 2, textAlign: "right" }}
                    >
                        {errorMessage}
                    </Alert>
                )}

                <form onSubmit={handleSubmit(send)} noValidate>
                    <TextField
                        label="מייל"
                        type="email"
                        fullWidth
                        margin="normal"
                        autoComplete="email"
                        disabled={isLoading}
                        error={Boolean(errors.email)}
                        helperText={errors.email?.message}
                        {...register("email", {
                            required: "יש להזין כתובת אימייל."
                        })}
                        InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                        label="סיסמה"
                        type="password"
                        fullWidth
                        margin="normal"
                        autoComplete="current-password"
                        disabled={isLoading}
                        error={Boolean(errors.password)}
                        helperText={errors.password?.message}
                        {...register("password", {
                            required: "יש להזין סיסמה."
                        })}
                        InputLabelProps={{ shrink: true }}
                    />

                    <FormControl fullWidth margin="normal">
                        <InputLabel>סוג משתמש</InputLabel>
                        <Select
                            value={userType}
                            disabled={isLoading}
                            onChange={event => {
                                setUserType(event.target.value as UserRole);
                                setErrorMessage("");
                            }}
                            label="סוג משתמש"
                        >
                            <MenuItem value="ADMIN">מנהל מערכת</MenuItem>
                            <MenuItem value="COMPANY">חברה</MenuItem>
                            <MenuItem value="CUSTOMER">לקוח</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        disabled={isLoading}
                        aria-busy={isLoading}
                        sx={{ mt: 3, fontWeight: "bold" }}
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
                                <CircularProgress size={20} color="inherit" />
                                מתחבר...
                            </Box>
                        ) : (
                            "התחבר"
                        )}
                    </Button>

                    <Typography
                        variant="caption"
                        display="block"
                        align="center"
                        color="text.secondary"
                        sx={{ mt: 2 }}
                    >
                        שרת ההדגמה עשוי להזדקק למספר רגעים כדי להתעורר.
                    </Typography>

                    <Box sx={{ mt: 2, textAlign: "center" }}>
                        <Button
                            disabled={isLoading}
                            onClick={() => navigate("/register")}
                            color="secondary"
                            sx={{ textTransform: "none" }}
                        >
                            אין לך חשבון? לחץ כאן להרשמה
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
}

export default Login;