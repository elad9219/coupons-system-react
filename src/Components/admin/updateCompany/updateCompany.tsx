
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
import { Company } from "../../../modal/Company";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import notify from "../../../util/notify";
import LoadingSpinner from "../../common/LoadingSpinner/LoadingSpinner";

function UpdateCompany(): JSX.Element {
    const location = useLocation();
    const navigate = useNavigate();

    const companyId = (location.state as any)?.companyId;

    const [company, setCompany] = useState<Company | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!companyId) {
            navigate("/admin/getAllCompanies");
            return;
        }

        jwtAxios.get<Company>(
            globals.admin.getOneCompany + companyId
        )
            .then(response => setCompany(response.data))
            .catch(() => notify.error("שגיאה בטעינת חברה"));
    }, [companyId, navigate]);

    const handleSave = async () => {
        if (!company || saving) return;

        setSaving(true);

        const payload = {
            id: company.id,
            name: company.name,
            email: company.email,
            ...(newPassword.trim() ? { password: newPassword } : {})
        };

        try {
            await jwtAxios.put(globals.admin.updateCompany, payload);
            notify.success("חברה עודכנה בהצלחה");
            navigate("/admin/getAllCompanies");
        } catch (error: any) {
            notify.error(
                error.response?.data?.description ||
                "שגיאה בעדכון חברה"
            );
        } finally {
            setSaving(false);
        }
    };

    if (!company) return <LoadingSpinner />;

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

                <Grid container spacing={2}>
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
                            disabled={saving}
                            onChange={e => setCompany({
                                ...company,
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

export default UpdateCompany;
