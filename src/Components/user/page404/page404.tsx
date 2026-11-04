import {
    Box,
    Button,
    Container,
    Paper,
    Typography
} from "@mui/material";

import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import { useNavigate } from "react-router-dom";

function Page404(): JSX.Element {
    const navigate = useNavigate();

    return (
        <Container
            maxWidth="sm"
            dir="rtl"
            sx={{
                mt: { xs: 3, md: 6 },
                mb: 6
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 3, sm: 5 },
                    textAlign: "center",
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 16px 44px rgba(20,38,61,0.07)"
                }}
            >
                <Box
                    sx={{
                        display: "grid",
                        placeItems: "center",
                        width: 72,
                        height: 72,
                        mx: "auto",
                        mb: 2.5,
                        borderRadius: 3,
                        bgcolor: "primary.light",
                        color: "primary.main"
                    }}
                >
                    <SearchOffRoundedIcon
                        sx={{ fontSize: 36 }}
                    />
                </Box>

                <Typography
                    component="h1"
                    variant="h5"
                    sx={{ fontWeight: 800, mb: 1 }}
                >
                    העמוד לא נמצא
                </Typography>

                <Typography
                    color="text.secondary"
                    sx={{ mb: 3, lineHeight: 1.8 }}
                >
                    הכתובת שאליה הגעת אינה זמינה.
                    אפשר לחזור לעמוד הבית ולהמשיך משם.
                </Typography>

                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/")}
                >
                    חזרה לעמוד הבית
                </Button>
            </Paper>
        </Container>
    );
}

export default Page404;