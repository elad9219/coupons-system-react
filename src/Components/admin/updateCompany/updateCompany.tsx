import { TextField, Button, Container, Paper, Typography, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Company } from "../../../modal/Company";
import jwtAxios from '../../../util/JWTaxios';
import globals from "../../../util/global";
import notify from "../../../util/notify";
import LoadingSpinner from "../../common/LoadingSpinner/LoadingSpinner";

function UpdateCompany(): JSX.Element {
    const location = useLocation();
    const navigate = useNavigate();
    const [company, setCompany] = useState<Company | null>(null);
    const companyId = (location.state as any)?.companyId;

    useEffect(() => {
        if (!companyId) { navigate("/admin/getAllCompanies"); return; }

        jwtAxios.get(globals.admin.getOneCompany + companyId)
            .then(response => setCompany(response.data))
            .catch(() => notify.error("שגיאה בטעינת חברה"));
    }, [companyId, navigate]);

    const handleSave = () => {
        if (!company) return;
        jwtAxios.put(globals.admin.updateCompany, company)
            .then(() => {
                notify.success("חברה עודכנה בהצלחה");
                navigate("/admin/getAllCompanies");
            })
            .catch(() => notify.error("שגיאה בעדכון"));
    };

    if (!company) return <LoadingSpinner />;

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }} dir="rtl">
                <Typography variant="h5" align="center" gutterBottom fontWeight="bold" color="primary">
                    עדכון פרטי חברה
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField 
                            label="שם חברה" fullWidth size="small" 
                            value={company.name} disabled // Name usually cannot be changed easily in some systems, keep disabled or enable if backend supports
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField 
                            label="אימייל" fullWidth size="small" 
                            value={company.email} 
                            onChange={e => setCompany({...company, email: e.target.value})} 
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField 
                            label="סיסמה" fullWidth size="small" 
                            value={company.password} 
                            onChange={e => setCompany({...company, password: e.target.value})} 
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="contained" fullWidth onClick={handleSave}>שמור שינויים</Button>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}

export default UpdateCompany;