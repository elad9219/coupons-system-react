import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Company } from "../../../modal/Company";
import { store } from "../../../redux/store";
import jwtAxios from "../../../util/JWTaxios";
import SingleCompany from "../singleCompany/singleCompany";
import "./getCompanyDetails.css"; // CSS Import
import globals from '../../../util/global';
import { downloadSingleCompany } from "../../../redux/companyState";
import { Container, Paper, Typography, Box } from "@mui/material";
import LoadingSpinner from "../../common/LoadingSpinner/LoadingSpinner";

function GetCompanyDetails(): JSX.Element {
    const navigate = useNavigate();
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        jwtAxios.get<Company>(globals.company.getCompanyDetails)
            .then((response) => {
                setCompany(response.data);
                store.dispatch(downloadSingleCompany([response.data]));
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                navigate("/login");
            });
    }, [navigate]);

    if (loading) return <LoadingSpinner />;
    if (!company) return <Typography>שגיאה בטעינת נתונים</Typography>;

    return (
        <Container maxWidth="xs" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }} dir="rtl">
                <Typography variant="h5" gutterBottom align="center" fontWeight="bold" color="primary">
                    פרטי חברה
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <SingleCompany company={company} updateCompany={() => navigate("/company/update")} />
                </Box>
            </Paper>
        </Container>
    );
}

export default GetCompanyDetails;