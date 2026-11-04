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

import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";

import { Company } from "../../../modal/Company";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import notify from "../../../util/notify";
import { getApiErrorMessage } from "../../../util/apiError";
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
            notify.error("יש להתחבר כחברה");
            navigate("/login");
            return;
        }

        jwtAxios.get<Company>(globals.company.getCompanyDetails)
            .then(response => setCompany(response.data))
            .catch(() => notify.error("שגיאה בטעינת פרטי החברה"))
            .finally(() => setLoading(false));
    }, [navigate]);

    const handleSave = async (
        event: FormEvent<HTMLFormElement>
    ): Promise<void> => {
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
        } catch (error) {
            notify.error(
                getApiErrorMessage(error, "שגיאה בעדכון פרטי החברה")
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    if (!company) {
        return (
            <Alert severity="error">
                לא ניתן לטעון את פרטי החברה
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
                        <StorefrontRoundedIcon sx={{ fontSize: 32 }} />
                    </Box>

                    <Typography
                        component="h1"
                        variant="h5"
                        sx={{ fontWeight: 800, mb: 0.75 }}
                    >
                        עדכון פרטי חברה
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.8 }}
                    >
                        עדכן את כתובת האימייל ואת פרטי הגישה לחשבון החברה.
                    </Typography>
                </Box>

                <Box component="form" onSubmit={handleSave}>
                    <Grid container spacing={2.5}>
                        <Grid item xs={12}>
                            <TextField
                                label="שם חברה"
                                fullWidth
                                value={company.name}
                                InputProps={{ readOnly: true }}
                                helperText="שם החברה אינו ניתן לשינוי"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="אימייל"
                                type="email"
                                fullWidth
                                autoComplete="email"
                                value={company.email}
                                onChange={event => setCompany({
                                    ...company,
                                    email: event.target.value
                                })}
                                disabled={saving}
                                inputProps={{
                                    dir: "ltr",
                                    style: { textAlign: "right" }
                                }}
                                required
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="סיסמה חדשה"
                                type="password"
                                fullWidth
                                value={newPassword}
                                onChange={event =>
                                    setNewPassword(event.target.value)
                                }
                                disabled={saving}
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
                                    onClick={() =>
                                        navigate("/company/getComapnyDetails")
                                    }
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
            </Paper>
        </Container>
    );
}

export default UpdateCompanyDetails;