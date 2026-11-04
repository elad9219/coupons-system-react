
import "./mainLayout.css";

import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import {
    Alert,
    Box,
    Button,
    CssBaseline,
    Drawer
} from "@mui/material";

import MyHeader from "./myHeader/myHeader";
import Menu from "./menu/menu";
import MyFooter from "./myFooter/myFooter";
import MenuRouting from "../routing/MenuRouting/MenuRouting";

import { store, RootState } from "../../redux/store";
import jwtAxios from "../../util/JWTaxios";
import globals from "../../util/global";

import {
    clearStoredSession,
    getSessionClaims,
    getValidStoredToken
} from "../../util/session";

import {
    downloadSingleCustomer
} from "../../redux/customerState";

import {
    downloadSingleCompany
} from "../../redux/companyState";

import {
    setUserId,
    setUserName,
    userLogin,
    userLogout
} from "../../redux/authState";

interface CustomerProfile {
    id: number;
    first_name: string;
}

interface CompanyProfile {
    id: number;
    name: string;
}

function MainLayout(): JSX.Element {
    const location = useLocation();
    const navigate = useNavigate();

    const userType = useSelector(
        (state: RootState) => state.authState.userType
    );

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [restoreError, setRestoreError] = useState("");
    const [restoreAttempt, setRestoreAttempt] = useState(0);

    useEffect(() => {
        sessionStorage.setItem(
            "lastPath",
            location.pathname
        );

        setMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const onSessionExpired = () => {
            setRestoreError("");
            setMobileMenuOpen(false);
            navigate("/login");
        };

        window.addEventListener(
            "sessionExpired",
            onSessionExpired
        );

        return () => {
            window.removeEventListener(
                "sessionExpired",
                onSessionExpired
            );
        };
    }, [navigate]);

    useEffect(() => {
        let active = true;

        const restoreSession = async () => {
            const token = getValidStoredToken();
            const claims = getSessionClaims(token);

            if (!token || !claims) {
                store.dispatch(userLogout());
                return;
            }

            store.dispatch(userLogin(token));
            setRestoreError("");

            if (claims.userType === "ADMIN") {
                store.dispatch(setUserName("Admin"));
                store.dispatch(setUserId(0));
                return;
            }

            try {
                if (claims.userType === "CUSTOMER") {
                    const response =
                        await jwtAxios.get<CustomerProfile>(
                            globals.customer.getCustomerDetails
                        );

                    if (!active) {
                        return;
                    }

                    const currentClaims = getSessionClaims(
                        getValidStoredToken()
                    );

                    if (!currentClaims) {
                        store.dispatch(userLogout());
                        return;
                    }

                    if (
                        currentClaims.userType !== "CUSTOMER" ||
                        currentClaims.userId !== claims.userId
                    ) {
                        return;
                    }

                    const customer = response.data;

                    if (
                        !customer ||
                        !Number.isInteger(customer.id) ||
                        customer.id <= 0 ||
                        !customer.first_name ||
                        (
                            typeof claims.userId === "number" &&
                            claims.userId !== customer.id
                        )
                    ) {
                        throw new Error("INVALID_CUSTOMER_PROFILE");
                    }

                    store.dispatch(
                        downloadSingleCustomer([customer as any])
                    );
                    store.dispatch(
                        setUserName(customer.first_name)
                    );
                    store.dispatch(setUserId(customer.id));
                }

                if (claims.userType === "COMPANY") {
                    const response =
                        await jwtAxios.get<CompanyProfile>(
                            globals.company.getCompanyDetails
                        );

                    if (!active) {
                        return;
                    }

                    const currentClaims = getSessionClaims(
                        getValidStoredToken()
                    );

                    if (!currentClaims) {
                        store.dispatch(userLogout());
                        return;
                    }

                    if (
                        currentClaims.userType !== "COMPANY" ||
                        currentClaims.userId !== claims.userId
                    ) {
                        return;
                    }

                    const company = response.data;

                    if (
                        !company ||
                        !Number.isInteger(company.id) ||
                        company.id <= 0 ||
                        !company.name ||
                        (
                            typeof claims.userId === "number" &&
                            claims.userId !== company.id
                        )
                    ) {
                        throw new Error("INVALID_COMPANY_PROFILE");
                    }

                    store.dispatch(
                        downloadSingleCompany([company as any])
                    );
                    store.dispatch(
                        setUserName(company.name)
                    );
                    store.dispatch(setUserId(company.id));
                }
            } catch (error) {
                if (!active) {
                    return;
                }

                const status = axios.isAxiosError(error)
                    ? error.response?.status
                    : undefined;

                if (status === 401 || status === 403) {
                    clearStoredSession();
                    store.dispatch(userLogout());
                    navigate("/login");
                    return;
                }

                if (!getValidStoredToken()) {
                    store.dispatch(userLogout());
                    return;
                }

                setRestoreError(
                    "לא הצלחנו לטעון את פרטי החשבון. " +
                    "בדוק את החיבור לשרת ונסה שוב."
                );
            }
        };

        void restoreSession();

        return () => {
            active = false;
        };
    }, [navigate, restoreAttempt]);

    return (
        <Box
            dir="rtl"
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                bgcolor: "background.default"
            }}
        >
            <CssBaseline />

            <Box
                component="header"
                sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1200
                }}
            >
                <MyHeader
                    showMenu={Boolean(userType)}
                    onMenuOpen={() => setMobileMenuOpen(true)}
                />
            </Box>

            <Box
                sx={{
                    display: "flex",
                    flexGrow: 1,
                    minWidth: 0,
                    width: "100%"
                }}
            >
                {Boolean(userType) && (
                    <>
                        <Box
                            component="aside"
                            sx={{
                                display: {
                                    xs: "none",
                                    md: "block"
                                },
                                width: 258,
                                flexShrink: 0,
                                bgcolor: "#FFFFFF",
                                borderLeft: "1px solid",
                                borderColor: "divider"
                            }}
                        >
                            <Menu />
                        </Box>

                        <Drawer
                            anchor="right"
                            open={mobileMenuOpen}
                            onClose={() => setMobileMenuOpen(false)}
                            ModalProps={{
                                keepMounted: true
                            }}
                            PaperProps={{
                                sx: {
                                    width: "min(320px, 86vw)",
                                    bgcolor: "#FFFFFF"
                                }
                            }}
                            sx={{
                                display: {
                                    xs: "block",
                                    md: "none"
                                }
                            }}
                        >
                            <Menu
                                onNavigate={() =>
                                    setMobileMenuOpen(false)
                                }
                            />
                        </Drawer>
                    </>
                )}

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        minWidth: 0,
                        maxWidth: "100%",
                        px: {
                            xs: 1.5,
                            sm: 2.5,
                            md: 3
                        },
                        pb: 5
                    }}
                >
                    {restoreError && (
                        <Alert
                            severity="warning"
                            role="alert"
                            sx={{
                                mt: 3,
                                maxWidth: 900,
                                mx: "auto"
                            }}
                            action={
                                <Button
                                    color="inherit"
                                    size="small"
                                    onClick={() => {
                                        setRestoreAttempt(
                                            previous => previous + 1
                                        );
                                    }}
                                >
                                    נסה שוב
                                </Button>
                            }
                        >
                            {restoreError}
                        </Alert>
                    )}

                    <MenuRouting />
                </Box>
            </Box>

            <Box component="footer">
                <MyFooter />
            </Box>
        </Box>
    );
}

export default MainLayout;
