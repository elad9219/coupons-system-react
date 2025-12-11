import { createTheme } from "@mui/material/styles";

const myTheme = createTheme({
    direction: "rtl",
    palette: {
        primary: {
        main: "#1976d2", // Professional Blue
        },
        secondary: {
        main: "#f50057", // Pink/Red for actions
        },
        background: {
        default: "#f4f6f8", // Light Grey background for the whole app
        paper: "#ffffff",
        },
    },
    typography: {
        fontFamily: "Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        h1: { fontSize: "2.5rem", fontWeight: 600, color: "#333" },
        h2: { fontSize: "2rem", fontWeight: 600, color: "#333" },
        h3: { fontSize: "1.75rem", fontWeight: 500 },
        body1: { fontSize: "1rem" },
    },
    components: {
        MuiButton: {
        styleOverrides: {
            root: {
            borderRadius: 8,
            textTransform: "none",
            fontWeight: "bold",
            },
        },
        },
        MuiCard: {
        styleOverrides: {
            root: {
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            },
        },
        },
    },
});

export default myTheme;