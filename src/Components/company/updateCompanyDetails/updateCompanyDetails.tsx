import { TextField, Button, Container, Paper, Typography, Grid, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Company } from "../../../modal/Company";
import jwtAxios from '../../../util/JWTaxios';
import globals from "../../../util/global";
import notify from "../../../util/notify";
import { store } from "../../../redux/store";
import "./updateCompanyDetails.css";

function UpdateCompanyDetails(): JSX.Element {
    const navigate = useNavigate();
    const [company, setCompany] = useState<Company | null>(null);

    useEffect(() => {
        // Validation: Only companies can access this page
        if (store.getState().authState.userType !== "COMPANY") {
            notify.error("Access denied");
            navigate("/login");
            return;
        }

        // Fetch company details
        jwtAxios.get<Company>(globals.company.getCompanyDetails)
            .then(res => {
                setCompany(res.data);
            })
            .catch(() => {
                notify.error("Error fetching company data");
            });
    }, [navigate]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!company) return;
        
        jwtAxios.put(globals.company.updateDetails, company)
            .then(() => {
                notify.success("הפרטים עודכנו בהצלחה");
                navigate("/company/getComapnyDetails");
            })
            .catch((err) => {
                const msg = err.response?.data?.description || "שגיאה בעדכון";
                notify.error(msg);
            });
    };

    if (!company) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><Typography>Loading...</Typography></Box>;

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }} dir="rtl">
                <Typography variant="h5" align="center" gutterBottom fontWeight="bold" color="primary">
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
                                fullWidth 
                                size="small" 
                                type="email"
                                value={company.email} 
                                onChange={e => setCompany({...company, email: e.target.value})} 
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                label="סיסמה" 
                                fullWidth 
                                size="small" 
                                type="text"
                                value={company.password} 
                                onChange={e => setCompany({...company, password: e.target.value})} 
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" fullWidth size="large" sx={{ fontWeight: 'bold' }}>
                                שמור שינויים
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
}

export default UpdateCompanyDetails;