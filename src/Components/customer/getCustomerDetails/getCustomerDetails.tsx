
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    Button
} from "@mui/material";
import { Customer } from "../../../modal/Customer";
import { store } from "../../../redux/store";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import notify from "../../../util/notify";
import LoadingSpinner from "../../common/LoadingSpinner/LoadingSpinner";

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
            notify.error("Access Denied");
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

    const handleSave = async () => {
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
            setNewPassword("");
            setEditMode(false);
            notify.success("פרטים עודכנו בהצלחה");
        } catch (error: any) {
            notify.error(
                error.response?.data?.description ||
                "שגיאה בעדכון פרטים"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (savedCustomer) {
            setCustomer({ ...savedCustomer });
        }

        setNewPassword("");
        setEditMode(false);
    };

    if (loading) return <LoadingSpinner />;

    if (!customer) {
        return <Typography align="center">שגיאה בטעינת נתונים</Typography>;
    }

    return (
        <Container maxWidth="xs" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }} dir="rtl">
                <Typography
                    variant="h5"
                    gutterBottom
                    align="center"
                    fontWeight="bold"
                    color="primary"
                >
                    הפרופיל שלי
                </Typography>

                <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField
                        label="שם פרטי"
                        size="small"
                        value={customer.first_name}
                        disabled={!editMode || saving}
                        onChange={e => setCustomer({
                            ...customer,
                            first_name: e.target.value
                        })}
                    />

                    <TextField
                        label="שם משפחה"
                        size="small"
                        value={customer.last_name}
                        disabled={!editMode || saving}
                        onChange={e => setCustomer({
                            ...customer,
                            last_name: e.target.value
                        })}
                    />

                    <TextField
                        label="אימייל"
                        type="email"
                        size="small"
                        value={customer.email}
                        disabled={!editMode || saving}
                        onChange={e => setCustomer({
                            ...customer,
                            email: e.target.value
                        })}
                    />

                    {editMode && (
                        <TextField
                            label="סיסמה חדשה"
                            type="password"
                            size="small"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            disabled={saving}
                            autoComplete="new-password"
                            helperText="השאר ריק כדי לשמור את הסיסמה הקיימת"
                        />
                    )}

                    {editMode ? (
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                                variant="contained"
                                onClick={handleSave}
                                disabled={saving}
                                fullWidth
                            >
                                {saving ? "שומר..." : "שמור"}
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={handleCancel}
                                disabled={saving}
                                fullWidth
                            >
                                ביטול
                            </Button>
                        </Box>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={() => setEditMode(true)}
                            fullWidth
                        >
                            עדכון פרטים
                        </Button>
                    )}
                </Box>
            </Paper>
        </Container>
    );
}

export default GetCustomerDetails;
