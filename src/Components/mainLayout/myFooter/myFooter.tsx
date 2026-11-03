
import { Box, Container, Typography } from "@mui/material";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";

function MyFooter(): JSX.Element {
    return (
        <Box
            component="footer"
            dir="rtl"
            sx={{
                borderTop: "1px solid",
                borderColor: "divider",
                bgcolor: "#FFFFFF",
                py: 2.5,
                mt: "auto"
            }}
        >
            <Container maxWidth="xl">
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 2
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            color: "text.secondary"
                        }}
                    >
                        <LocalOfferOutlinedIcon
                            sx={{
                                fontSize: 18,
                                color: "primary.main"
                            }}
                        />

                        <Typography
                            variant="body2"
                            fontWeight={700}
                        >
                            אתר קופונים
                        </Typography>
                    </Box>

                    <Typography
                        variant="caption"
                        color="text.secondary"
                    >
                        © {new Date().getFullYear()} כל הזכויות שמורות
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}

export default MyFooter;
