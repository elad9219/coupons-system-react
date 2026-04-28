import { CircularProgress, Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

function LoadingSpinner(): JSX.Element {
    // State to determine if we should show the cold start message
    const [isWakingUp, setIsWakingUp] = useState(false);

    useEffect(() => {
        // Listeners for the custom events dispatched by JWTaxios
        const handleWakeUp = () => setIsWakingUp(true);
        const handleAwake = () => setIsWakingUp(false);

        window.addEventListener('serverWakingUp', handleWakeUp);
        window.addEventListener('serverAwake', handleAwake);

        // Cleanup listeners on unmount
        return () => {
            window.removeEventListener('serverWakingUp', handleWakeUp);
            window.removeEventListener('serverAwake', handleAwake);
        };
    }, []);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
            
            {/* Show the text ONLY if the Axios interceptor detected a cold start */}
            {isWakingUp && (
                <Typography variant="body1" sx={{ mt: 3, color: '#333', textAlign: 'center', maxWidth: '400px' }}>
                    ⏳ השרת החינמי מתעורר משינה (יכול לקחת כ-10 שניות). אנא המתן...
                </Typography>
            )}
        </Box>
    );
}

export default LoadingSpinner;