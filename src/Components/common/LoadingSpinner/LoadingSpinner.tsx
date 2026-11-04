import { CircularProgress, Box, Typography } from "@mui/material";

function LoadingSpinner(): JSX.Element {
    return (
        <Box
            dir="rtl"
            role="status"
            aria-live="polite"
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "40vh",
                px: 3,
                py: 5,
                textAlign: "center"
            }}
        >
            <Box
                sx={{
                    display: "grid",
                    placeItems: "center",
                    width: 72,
                    height: 72,
                    bgcolor: "primary.light",
                    borderRadius: 3,
                    mb: 2.5
                }}
            >
                <CircularProgress size={32} thickness={4} />
            </Box>

            <Typography
                sx={{
                    fontWeight: 700,
                    color: "text.primary"
                }}
            >
                טוענים את הנתונים...
            </Typography>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                    mt: 1,
                    maxWidth: 380,
                    lineHeight: 1.8
                }}
            >
                אם שרת ההדגמה במצב שינה, התעוררותו עשויה להימשך מעט זמן.
                אנחנו מנסים להתחבר והנתונים יופיעו לאחר טעינה מוצלחת.
            </Typography>
        </Box>
    );
}

export default LoadingSpinner;