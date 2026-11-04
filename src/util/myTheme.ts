import { createTheme, Theme } from "@mui/material/styles";

const formPaperStyles = (theme: Theme) => ({
    "&&": {
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 32,
        padding: theme.spacing(4),
        boxShadow: "0 16px 44px rgba(20,38,61,0.07)",
        [theme.breakpoints.down("sm")]: {
            padding: theme.spacing(2.5),
            borderRadius: 24
        },
        "& > .MuiTypography-h4, & > .MuiTypography-h5": {
            color: theme.palette.text.primary,
            fontSize: "1.4rem",
            fontWeight: 800,
            lineHeight: 1.5,
            marginBottom: theme.spacing(3),
            overflowWrap: "anywhere"
        },
        "& .MuiInputBase-sizeSmall:not(.MuiInputBase-multiline)": {
            minHeight: 52
        },
        "& .MuiInputBase-inputSizeSmall": {
            paddingTop: 14,
            paddingBottom: 14
        },
        "& .MuiInputLabel-sizeSmall:not(.MuiInputLabel-shrink)": {
            transform: "translate(14px, 15px) scale(1)"
        },
        "& .MuiButton-fullWidth": {
            minHeight: 50
        }
    }
});

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
                    gap: 8,
                    boxShadow: "none"
                },
                startIcon: {
                    margin: 0
                },
                endIcon: {
                    margin: 0
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
                },
                elevation2: {
                    border: "1px solid #E6EBF2",
                    boxShadow: "0 8px 26px rgba(20,38,61,0.04)"
                },
                elevation3: ({ theme }) => formPaperStyles(theme),
                elevation4: ({ theme }) => formPaperStyles(theme)
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
        MuiSlider: {
            styleOverrides: {
                thumb: ({ ownerState, theme }) => ({
                    ...(ownerState.orientation === "horizontal" &&
                        theme.direction === "rtl"
                        ? {
                            transform: "translate(50%, -50%)"
                        }
                        : {})
                })
            }
        },
        MuiDialog: {
            defaultProps: {
                dir: "rtl"
            },
            styleOverrides: {
                paper: {
                    borderRadius: 24,
                    border: "1px solid #E6EBF2",
                    boxShadow: "0 24px 80px rgba(20,38,61,0.2)"
                }
            }
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    padding: "24px 24px 16px",
                    fontWeight: 800,
                    color: "#14263D"
                }
            }
        },
        MuiDialogContentText: {
            styleOverrides: {
                root: {
                    lineHeight: 1.9,
                    color: "#68778B",
                    overflowWrap: "anywhere"
                }
            }
        },
        MuiDialogActions: {
            styleOverrides: {
                root: {
                    padding: "16px 24px 24px",
                    gap: 8,
                    borderTop: "1px solid #E6EBF2",
                    "& > :not(:first-of-type)": {
                        marginLeft: 0
                    },
                    "& .MuiButton-root": {
                        minHeight: 42,
                        minWidth: 84
                    }
                }
            }
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 14,
                    border: "1px solid transparent",
                    textAlign: "right",
                    alignItems: "flex-start"
                },
                icon: {
                    marginRight: 0,
                    marginLeft: 12,
                    paddingTop: 8
                },
                message: {
                    lineHeight: 1.8,
                    overflowWrap: "anywhere",
                    minWidth: 0
                },
                action: {
                    marginRight: 8,
                    marginLeft: -8,
                    paddingRight: 0,
                    paddingLeft: 0
                },
                standardSuccess: {
                    backgroundColor: "#EFFAF5",
                    borderColor: "#CDEDDD",
                    color: "#0E684B"
                },
                standardError: {
                    backgroundColor: "#FFF3F5",
                    borderColor: "#F5D2D9",
                    color: "#9D263C"
                },
                standardWarning: {
                    backgroundColor: "#FFF8ED",
                    borderColor: "#F5E1BE",
                    color: "#8A5516"
                },
                standardInfo: {
                    backgroundColor: "#F0F5FF",
                    borderColor: "#D5E2FF",
                    color: "#264CB8"
                }
            }
        }
    }
});

export default myTheme;