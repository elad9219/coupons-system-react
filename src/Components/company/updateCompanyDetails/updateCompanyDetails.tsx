
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    TextField,
    Button,
    Container,
    Paper,
    Typography,
    Grid,
    Box
} from "@mui/material";
import { Company } from "../../../modal/Company";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import notify from "../../../util/notify";
import { store } from "../../../redux/store";
import LoadingSpinner from "../../common/LoadingSpinner/LoadingSpinner";

function UpdateCompanyDetails(): JSX.Element {
    const navigate = useNavigate();

    const [company, setCompany] = useState<Company | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (store.getState().authState.userType !== "COMPANY") {
            notify.error("Access denied");
            navigate("/login");
            return;
        }

        jwtAxios.get<Company>(globals.company.getCompanyDetails)
            .then(response => setCompany(response.data))
            .catch(() => {
                notify.error("שגיאה בטעינת פרטי החברה");
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    const handleSave = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!company || saving) return;

        setSaving(true);

        const payload = {
            name: company.name,
            email: company.email,
            ...(newPassword.trim() ? { password: newPassword } : {})
        };

        try {
            await jwtAxios.put(globals.company.updateDetails, payload);
            notify.success("הפרטים עודכנו בהצלחה");
            navigate("/company/getComapnyDetails");
        } catch (error: any) {
            notify.error(
                error.response?.data?.description ||
                "שגיאה בעדכון פרטי החברה"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    if (!company) {
        return (
            <Box sx={{ mt: 5, textAlign: "center" }}>
                <Typography>לא ניתן לטעון את פרטי החברה</Typography>
            </Box>
        );
    }

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
                    עדכון פרטי חברה
                </Typography>

                <form onSubmit={handleSave}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                label="שם חברה"
                                fullWidth
                                size="small"
                                value={company.name}
                                disabled
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="אימייל"
                                type="email"
                                fullWidth
                                size="small"
                                value={company.email}
                                onChange={e => setCompany({
                                    ...company,
                                    email: e.target.value
                                })}
                                disabled={saving}
                                required
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
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                disabled={saving}
                                sx={{ fontWeight: "bold" }}
                            >
                                {saving ? "שומר..." : "שמור שינויים"}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
}

export default UpdateCompanyDetails;
