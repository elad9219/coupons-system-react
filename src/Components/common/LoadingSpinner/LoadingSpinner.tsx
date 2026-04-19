import { CircularProgress, Box, Typography } from "@mui/material";

function LoadingSpinner(): JSX.Element {
    return (
        <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dark overlay
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
        }}>
            <Box sx={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '10px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                textAlign: 'center',
                maxWidth: '400px'
            }}>
                <CircularProgress size={60} />
                <Typography variant="body1" sx={{ mt: 3, color: '#333', lineHeight: 1.5 }}>
                    ⏳ Initializing free server tier. The backend needs about <b>10 seconds</b> to wake up for the <b>first request</b>.
                    After that, everything will be <b>instant</b>!
                </Typography>
            </Box>
        </Box>
    );
}

export default LoadingSpinner;