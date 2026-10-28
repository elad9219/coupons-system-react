
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    TextField,
    Button,
    Container,
    Paper,
    Typography,
    Grid
} from "@mui/material";
import { Customer } from "../../../modal/Customer";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import notify from "../../../util/notify";
import LoadingSpinner from "../../common/LoadingSpinner/LoadingSpinner";

function UpdateCustomer(): JSX.Element {
    const location = useLocation();
    const navigate = useNavigate();

    const customerId = (location.state as any)?.customerId;

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!customerId) {
            navigate("/admin/getAllCustomers");
            return;
        }

        jwtAxios.get<Customer>(
            globals.admin.getOneCustomer + customerId
        )
            .then(response => setCustomer(response.data))
            .catch(() => notify.error("שגיאה בטעינת לקוח"));
    }, [customerId, navigate]);

    const handleSave = async () => {
        if (!customer || saving) return;

        setSaving(true);

        const payload = {
            id: customer.id,
            first_name: customer.first_name,
            last_name: customer.last_name,
            email: customer.email,
            ...(newPassword.trim() ? { password: newPassword } : {})
        };

        try {
            await jwtAxios.put(globals.admin.updateCustomer, payload);
            notify.success("לקוח עודכן בהצלחה");
            navigate("/admin/getAllCustomers");
        } catch (error: any) {
            notify.error(
                error.response?.data?.description ||
                "שגיאה בעדכון לקוח"
            );
        } finally {
            setSaving(false);
        }
    };

    if (!customer) return <LoadingSpinner />;

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }} dir="rtl">
                <Typography
                    variant="h5"
                    align="center"
                    gutterBottom
                    fontWeight="bold"
                    color="primary"
                >
                    עדכון פרטי לקוח
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField
                            label="שם פרטי"
                            fullWidth
                            size="small"
                            value={customer.first_name}
                            disabled={saving}
                            onChange={e => setCustomer({
                                ...customer,
                                first_name: e.target.value
                            })}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            label="שם משפחה"
                            fullWidth
                            size="small"
                            value={customer.last_name}
                            disabled={saving}
                            onChange={e => setCustomer({
                                ...customer,
                                last_name: e.target.value
                            })}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="אימייל"
                            type="email"
                            fullWidth
                            size="small"
                            value={customer.email}
                            disabled={saving}
                            onChange={e => setCustomer({
                                ...customer,
                                email: e.target.value
                            })}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="סיסמה חדשה"
                            type="password"
                            fullWidth
                            size="small"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            disabled={saving}
                            autoComplete="new-password"
                            helperText="השאר ריק כדי לשמור את הסיסמה הקיימת"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? "שומר..." : "שמור שינויים"}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}

export default UpdateCustomer;
