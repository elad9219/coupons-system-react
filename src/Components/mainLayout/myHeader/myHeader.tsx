import { useNavigate } from "react-router-dom";
import homepage from "../../../assets/homepage.png";
import { Button, AppBar, Toolbar, Typography, Box, IconButton } from "@mui/material";
import { userLogout } from "../../../redux/authState";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';

function MyHeader(): JSX.Element {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userType = useSelector((state: RootState) => state.authState.userType);
    const userName = useSelector((state: RootState) => state.authState.userName);

    const login = () => {
        navigate("/login");
    };

    const logout = () => {
        dispatch(userLogout());
        localStorage.removeItem('token');
        navigate("/");
    };

    return (
        <AppBar position="sticky" color="primary" elevation={3}>
            <Toolbar sx={{ display: 'flex', alignItems: 'center' }}>
                {/* Logo Section */}
                <IconButton 
                    edge="start" 
                    color="inherit" 
                    aria-label="home" 
                    onClick={() => navigate("/")} 
                >
                    <img src={homepage} alt="logo" style={{width: 32, height: 32, filter: 'brightness(0) invert(1)'}} />
                </IconButton>

                {/* Brand Text - Reduced pr to 2 for a more subtle spacing */}
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 1, pr: 2 }}>
                    אתר קופונים
                </Typography>

                {/* User Greeting */}
                {userType && (
                    <Typography variant="body1" sx={{ marginLeft: 3, fontWeight: 500 }}>
                        שלום, {userName || "אורח"}
                    </Typography>
                )}

                {/* Auth Buttons */}
                <Box sx={{ marginLeft: 3 }}>
                    {!userType ? (
                        <Button 
                            color="inherit" 
                            startIcon={<LoginIcon sx={{ ml: 1 }}/>} 
                            onClick={login}
                            variant="outlined"
                            sx={{ borderColor: 'rgba(255,255,255,0.5)', borderRadius: 20, px: 3 }}
                        >
                            כניסה
                        </Button>
                    ) : (
                        <Button 
                            color="inherit" 
                            endIcon={<LogoutIcon sx={{ mr: 1 }}/>} 
                            onClick={logout}
                            sx={{ fontWeight: 'bold' }}
                        >
                            יציאה
                        </Button>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default MyHeader;