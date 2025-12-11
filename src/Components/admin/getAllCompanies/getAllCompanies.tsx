import { useEffect, useState } from "react";
import { store } from "../../../redux/store";
import { Company } from "../../../modal/Company";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import SingleCompany from "../../company/singleCompany/singleCompany";
import { Container, Grid, Typography, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import advNotify from "../../../util/notify_advanced";

function GetAllCompanies(): JSX.Element {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (store.getState().authState.userType !== "ADMIN") {
            advNotify.error("Admin only");
            navigate("/login");
            return;
        }
        jwtAxios.get<Company[]>(globals.admin.getAllCompanies)
            .then(response => {
                setCompanies(response.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [navigate]);

    const handleDelete = (id: number) => {
        setCompanies(companies.filter(c => c.id !== id));
    };

    const handleUpdate = (company: Company) => {
        navigate("/admin/updateCompany", { state: { companyId: company.id } });
    };

    if (loading) return <Container sx={{textAlign:'center', mt:5}}><CircularProgress/></Container>;

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
                ניהול חברות
            </Typography>
            <Grid container spacing={3}>
                {companies.map((company) => (
                    <Grid item key={company.id} xs={12} sm={6} md={4} lg={3}>
                        <SingleCompany 
                            company={company} 
                            updateCompany={() => handleUpdate(company)} // Fix callback
                            onDelete={handleDelete} // Fix update UI
                        />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}

export default GetAllCompanies;