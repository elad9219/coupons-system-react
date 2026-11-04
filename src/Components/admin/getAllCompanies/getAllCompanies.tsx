
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Grid,
    Typography
} from "@mui/material";

import { store } from "../../../redux/store";
import { Company } from "../../../modal/Company";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import SingleCompany from "../../company/singleCompany/singleCompany";
import advNotify from "../../../util/notify_advanced";

function GetAllCompanies(): JSX.Element {
    const navigate = useNavigate();

    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        if (store.getState().authState.userType !== "ADMIN") {
            advNotify.error("יש להתחבר כמנהל מערכת");
            navigate("/login");
            return;
        }

        let active = true;

        const loadCompanies = async (): Promise<void> => {
            setLoading(true);
            setErrorMessage("");

            try {
                const response = await jwtAxios.get<Company[]>(
                    globals.admin.getAllCompanies
                );

                if (!active) {
                    return;
                }

                if (!Array.isArray(response.data)) {
                    throw new Error("Invalid companies response");
                }

                setCompanies(response.data);
            } catch {
                if (!active) {
                    return;
                }

                setCompanies([]);
                setErrorMessage(
                    "לא הצלחנו לטעון את רשימת החברות. נסה שוב."
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadCompanies();

        return () => {
            active = false;
        };
    }, [navigate, retryCount]);

    const handleDelete = (id: number): void => {
        setCompanies(previous =>
            previous.filter(company => company.id !== id)
        );
    };

    const handleUpdate = (company: Company): void => {
        navigate("/admin/updateCompany", {
            state: { companyId: company.id }
        });
    };

    return (
        <Container
            maxWidth="xl"
            sx={{ mt: 4, mb: 4 }}
            dir="rtl"
        >
            <Typography
                variant="h4"
                align="center"
                gutterBottom
                fontWeight="bold"
                color="primary"
            >
                ניהול חברות
            </Typography>

            {loading ? (
                <Box
                    role="status"
                    aria-label="טוען חברות"
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        py: 6
                    }}
                >
                    <CircularProgress />
                </Box>
            ) : errorMessage ? (
                <Alert
                    severity="error"
                    role="alert"
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={() =>
                                setRetryCount(previous => previous + 1)
                            }
                        >
                            נסה שוב
                        </Button>
                    }
                >
                    {errorMessage}
                </Alert>
            ) : companies.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 6 }}>
                    <Typography
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        אין חברות במערכת כרגע.
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={() => navigate("/admin/addCompany")}
                    >
                        הוסף חברה
                    </Button>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {companies.map(company => (
                        <Grid
                            item
                            key={company.id}
                            xs={12}
                            sm={12}
                            md={6}
                            lg={4}
                        >
                            <SingleCompany
                                company={company}
                                updateCompany={() =>
                                    handleUpdate(company)
                                }
                                onDelete={handleDelete}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}

export default GetAllCompanies;
