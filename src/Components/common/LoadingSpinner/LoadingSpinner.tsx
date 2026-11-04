import { CircularProgress, Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

function LoadingSpinner(): JSX.Element {
    const [isWakingUp, setIsWakingUp] = useState(false);

    useEffect(() => {
        const handleWakeUp = () => setIsWakingUp(true);
        const handleAwake = () => setIsWakingUp(false);

        window.addEventListener("serverWakingUp", handleWakeUp);
        window.addEventListener("serverAwake", handleAwake);

        return () => {
            window.removeEventListener("serverWakingUp", handleWakeUp);
            window.removeEventListener("serverAwake", handleAwake);
        };
    }, []);

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
                {isWakingUp
                    ? "שרת ההדגמה מתעורר"
                    : "טוענים את הנתונים..."}
            </Typography>

            {isWakingUp && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mt: 1,
                        maxWidth: 380,
                        lineHeight: 1.8
                    }}
                >
                    הטעינה הראשונה עשויה להימשך מעט יותר.
                    אנחנו מנסים להתחבר מחדש.
                </Typography>
            )}
        </Box>
    );
}

export default LoadingSpinner;