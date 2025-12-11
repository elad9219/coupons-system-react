import { Button, TextField, Container, Paper, Typography, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Company } from "../../../modal/Company";
import { store } from "../../../redux/store";
import globals from "../../../util/global";
import jwtAxios from "../../../util/JWTaxios";
import notify from "../../../util/notify";
import advNotify from "../../../util/notify_advanced";
import SingleCompany from "../../company/singleCompany/singleCompany";

function GetOneCompany(): JSX.Element {
    const navigate = useNavigate();
    const [company, setCompany] = useState<Company | null>(null);
    const [companyId, setCompanyId] = useState(1); // Default ID 1

    useEffect(() => {
        if (store.getState().authState.userType !== "ADMIN") {
            advNotify.error("Access Denied");
            navigate("/login");
        }
    }, [navigate]);

    const findCompany = () => {
        if (companyId < 1) { notify.error("ID לא חוקי"); return; }

        jwtAxios.get(globals.admin.getOneCompany + companyId)
            .then((response) => {
                setCompany(response.data);
            })
            .catch(() => {
                notify.error("חברה לא נמצאה");
                setCompany(null);
            });
    };

    const handleUpdate = () => {
        if (company) navigate("/admin/updateCompany", { state: { companyId: company.id } });
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }} dir="rtl">
                <Typography variant="h5" align="center" gutterBottom fontWeight="bold" color="primary">
                    חיפוש חברה
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField 
                        type="number" label="מזהה חברה (ID)" fullWidth size="small"
                        value={companyId}
                        onChange={(e) => setCompanyId(+e.target.value)}
                        InputProps={{ inputProps: { min: 1 } }}
                    />
                    <Button variant="contained" onClick={findCompany} sx={{ minWidth: 100 }}>חפש</Button>
                </Box>
                
                {company && (
                    <SingleCompany 
                        company={company} 
                        updateCompany={handleUpdate} 
                        onDelete={() => setCompany(null)}
                    />
                )}
            </Paper>
        </Container>
    );
}

export default GetOneCompany;