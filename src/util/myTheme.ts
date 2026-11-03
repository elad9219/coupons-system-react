import { createTheme } from "@mui/material/styles";

const myTheme = createTheme({
    direction: "rtl",
    palette: {
        mode: "light",
        primary: {
            main: "#3666E8",
            dark: "#264CB8",
            light: "#EAF0FF",
            contrastText: "#FFFFFF"
        },
        secondary: {
            main: "#15A69C",
            dark: "#0B8179",
            light: "#E7F8F5"
        },
        error: {
            main: "#DC4658"
        },
        warning: {
            main: "#F28A30"
        },
        success: {
            main: "#159B75"
        },
        text: {
            primary: "#14263D",
            secondary: "#68778B"
        },
        background: {
            default: "#F5F7FB",
            paper: "#FFFFFF"
        },
        divider: "#E6EBF2"
    },
    shape: {
        borderRadius: 14
    },
    typography: {
        fontFamily: [
            "Segoe UI",
            "Arial",
            "Helvetica",
            "sans-serif"
        ].join(","),
        h3: {
            fontWeight: 800,
            fontSize: "2.1rem",
            letterSpacing: "-0.03em"
        },
        h4: {
            fontWeight: 800,
            fontSize: "1.8rem",
            letterSpacing: "-0.02em"
        },
        h5: {
            fontWeight: 750,
            fontSize: "1.4rem"
        },
        h6: {
            fontWeight: 700
        },
        button: {
            fontWeight: 700,
            textTransform: "none"
        }
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: "#F5F7FB"
                },
                "*": {
                    boxSizing: "border-box"
                },
                "::selection": {
                    backgroundColor: "#D9E5FF",
                    color: "#14263D"
                }
            }
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true
            },
            styleOverrides: {
                root: {
                    borderRadius: 11,
                    textTransform: "none",
                    fontWeight: 700,
                    minHeight: 38,
                    boxShadow: "none"
                },
                containedPrimary: {
                    boxShadow: "0 5px 14px rgba(54,102,232,0.16)",
                    "&:hover": {
                        boxShadow: "0 8px 20px rgba(54,102,232,0.22)"
                    }
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                rounded: {
                    borderRadius: 18
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 18,
                    boxShadow: "0 8px 28px rgba(20,38,61,0.06)"
                }
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 11,
                    backgroundColor: "#FFFFFF",
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#A5B8DD"
                    }
                },
                notchedOutline: {
                    borderColor: "#D8E0EC"
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 650,
                    borderRadius: 9
                }
            }
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 12
                }
            }
        }
    }
});

export default myTheme;