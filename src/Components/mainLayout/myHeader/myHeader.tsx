import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
    AppBar,
    Box,
    Button,
    Chip,
    IconButton,
    Toolbar,
    Typography
} from "@mui/material";

import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";

import { RootState } from "../../../redux/store";
import { userLogout } from "../../../redux/authState";
import { clearStoredSession } from "../../../util/session";

interface MyHeaderProps {
    showMenu?: boolean;
    onMenuOpen?: () => void;
}

function MyHeader({
    showMenu = false,
    onMenuOpen
}: MyHeaderProps): JSX.Element {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const userType = useSelector(
        (state: RootState) => state.authState.userType
    );

    const userName = useSelector(
        (state: RootState) => state.authState.userName
    );

    const roleLabel =
        userType === "ADMIN"
            ? "מנהל מערכת"
            : userType === "COMPANY"
                ? "חברה"
                : userType === "CUSTOMER"
                    ? "לקוח"
                    : "";

    const logout = (): void => {
        clearStoredSession();
        dispatch(userLogout());
        navigate("/");
    };

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                background:
                    "linear-gradient(110deg, #14263D 0%, #1B3556 100%)",
                borderBottom: "1px solid rgba(255,255,255,0.08)"
            }}
        >
            <Toolbar
                dir="rtl"
                sx={{
                    minHeight: { xs: 66, sm: 76 },
                    px: { xs: 2, sm: 3, md: 4 },
                    gap: { xs: 1, sm: 2 }
                }}
            >
                {showMenu && (
                    <IconButton
                        color="inherit"
                        aria-label="פתח תפריט ניווט"
                        onClick={onMenuOpen}
                        sx={{
                            display: { xs: "inline-flex", md: "none" },
                            borderRadius: 2
                        }}
                    >
                        <MenuRoundedIcon />
                    </IconButton>
                )}

                <Box
                    onClick={() => navigate("/")}
                    role="link"
                    tabIndex={0}
                    onKeyDown={event => {
                        if (event.key === "Enter") {
                            navigate("/");
                        }
                    }}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        cursor: "pointer",
                        minWidth: 0
                    }}
                >
                    <Box
                        sx={{
                            width: 41,
                            height: 41,
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                            borderRadius: 2.5,
                            bgcolor: "rgba(255,255,255,0.12)",
                            color: "#9BE6DF"
                        }}
                    >
                        <StorefrontRoundedIcon />
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontSize: { xs: 15, sm: 20 },
                                fontWeight: 800,
                                color: "#FFFFFF",
                                whiteSpace: "nowrap"
                            }}
                        >
                            אתר קופונים
                        </Typography>

                        <Typography
                            variant="caption"
                            sx={{
                                color: "#B6C8DF",
                                display: { xs: "none", sm: "block" }
                            }}
                        >
                            מוצאים יותר, משלמים פחות
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ flexGrow: 1 }} />

                {userType && (
                    <Chip
                        icon={
                            <LocalOfferOutlinedIcon
                                sx={{ color: "#9BE6DF !important" }}
                            />
                        }
                        label={roleLabel}
                        size="small"
                        sx={{
                            display: { xs: "none", md: "flex" },
                            bgcolor: "rgba(255,255,255,0.08)",
                            color: "#E7EFFB",
                            border: "1px solid rgba(255,255,255,0.12)"
                        }}
                    />
                )}

                {userType && (
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#E7EFFB",
                            maxWidth: 170,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: { xs: "none", sm: "block" }
                        }}
                    >
                        שלום, {userName || "משתמש"}
                    </Typography>
                )}

                {!userType ? (
                    <Button
                        variant="contained"
                        onClick={() => navigate("/login")}
                        startIcon={<LoginRoundedIcon />}
                        sx={{
                            flexShrink: 0,
                            bgcolor: "#FFFFFF",
                            color: "#14263D",
                            px: { xs: 1.5, sm: 2.5 },
                            "&:hover": {
                                bgcolor: "#EAF0FF"
                            }
                        }}
                    >
                        כניסה
                    </Button>
                ) : (
                    <Button
                        color="inherit"
                        onClick={logout}
                        startIcon={<LogoutRoundedIcon />}
                        sx={{
                            flexShrink: 0,
                            border: "1px solid rgba(255,255,255,0.2)",
                            px: { xs: 1.2, sm: 2 },
                            "&:hover": {
                                bgcolor: "rgba(255,255,255,0.1)"
                            }
                        }}
                    >
                        יציאה
                    </Button>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default MyHeader;