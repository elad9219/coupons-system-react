import { FormEvent, useEffect, useState } from "react";
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

import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";

import { Customer } from "../../../modal/Customer";
import { store } from "../../../redux/store";
import { setUserName } from "../../../redux/authState";
import { downloadSingleCustomer } from "../../../redux/customerState";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import notify from "../../../util/notify";
import { getApiErrorMessage } from "../../../util/apiError";
import LoadingSpinner from "../../common/LoadingSpinner/LoadingSpinner";
import SingleCustomer from "../singleCustomer/singleCustomer";

function GetCustomerDetails(): JSX.Element {
    const navigate = useNavigate();

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [savedCustomer, setSavedCustomer] = useState<Customer | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        if (store.getState().authState.userType !== "CUSTOMER") {
            notify.error("יש להתחבר כלקוח");
            navigate("/login");
            return;
        }

        jwtAxios.get<Customer>(globals.customer.getCustomerDetails)
            .then(response => {
                setCustomer(response.data);
                setSavedCustomer(response.data);
            })
            .catch(() => {
                notify.error("שגיאה בטעינת פרטי החשבון");
                navigate("/login");
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    const handleSave = async (
        event: FormEvent<HTMLFormElement>
    ): Promise<void> => {
        event.preventDefault();

        if (!customer || saving) return;

        setSaving(true);

        const payload = {
            first_name: customer.first_name,
            last_name: customer.last_name,
            email: customer.email,
            ...(newPassword.trim() ? { password: newPassword } : {})
        };

        try {
            await jwtAxios.put(globals.customer.updateDetails, payload);

            setSavedCustomer({ ...customer });
            store.dispatch(downloadSingleCustomer([{ ...customer }]));
            store.dispatch(setUserName(customer.first_name));

            setNewPassword("");
            setEditMode(false);
            notify.success("פרטים עודכנו בהצלחה");
        } catch (error) {
            notify.error(
                getApiErrorMessage(error, "שגיאה בעדכון פרטים")
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = (): void => {
        if (savedCustomer) {
            setCustomer({ ...savedCustomer });
        }

        setNewPassword("");
        setEditMode(false);
    };

    if (loading) return <LoadingSpinner />;

    if (!customer) {
        return (
            <Alert severity="error">
                שגיאה בטעינת נתוני החשבון
            </Alert>
        );
    }

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
                <Box sx={{ textAlign: "center", mb: 3 }}>
                    {editMode && (
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
                            <ManageAccountsRoundedIcon
                                sx={{ fontSize: 32 }}
                            />
                        </Box>
                    )}

                    <Typography
                        component="h1"
                        variant="h5"
                        sx={{ fontWeight: 800, mb: 0.75 }}
                    >
                        {editMode
                            ? "עדכון פרטי החשבון"
                            : "הפרופיל שלי"}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.8 }}
                    >
                        {editMode
                            ? "עדכן את הפרטים האישיים שלך ושמור את השינויים."
                            : "פרטי החשבון האישי שלך, במקום אחד."}
                    </Typography>
                </Box>

                {!editMode ? (
                    <SingleCustomer
                        customer={customer}
                        updateCustomer={() => setEditMode(true)}
                    />
                ) : (
                    <Box
                        component="form"
                        onSubmit={handleSave}
                        noValidate
                    >
                        <Grid container spacing={2.5}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="שם פרטי"
                                    fullWidth
                                    autoComplete="given-name"
                                    value={customer.first_name}
                                    disabled={saving}
                                    onChange={event => setCustomer({
                                        ...customer,
                                        first_name: event.target.value
                                    })}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="שם משפחה"
                                    fullWidth
                                    autoComplete="family-name"
                                    value={customer.last_name}
                                    disabled={saving}
                                    onChange={event => setCustomer({
                                        ...customer,
                                        last_name: event.target.value
                                    })}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="אימייל"
                                    type="email"
                                    fullWidth
                                    autoComplete="email"
                                    value={customer.email}
                                    disabled={saving}
                                    inputProps={{
                                        dir: "ltr",
                                        style: { textAlign: "right" }
                                    }}
                                    onChange={event => setCustomer({
                                        ...customer,
                                        email: event.target.value
                                    })}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="סיסמה חדשה"
                                    type="password"
                                    fullWidth
                                    value={newPassword}
                                    disabled={saving}
                                    onChange={event =>
                                        setNewPassword(event.target.value)
                                    }
                                    autoComplete="new-password"
                                    helperText="השאר ריק כדי לשמור את הסיסמה הקיימת"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 1.5,
                                        mt: 1
                                    }}
                                >
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        disabled={saving}
                                        aria-busy={saving}
                                        sx={{
                                            minHeight: 50,
                                            borderRadius: 2.5
                                        }}
                                    >
                                        {saving && (
                                            <CircularProgress
                                                size={18}
                                                color="inherit"
                                            />
                                        )}
                                        {saving
                                            ? "שומר..."
                                            : "שמור שינויים"}
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        onClick={handleCancel}
                                        disabled={saving}
                                        sx={{
                                            minWidth: 90,
                                            borderRadius: 2.5
                                        }}
                                    >
                                        ביטול
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Paper>
        </Container>
    );
}

export default GetCustomerDetails;