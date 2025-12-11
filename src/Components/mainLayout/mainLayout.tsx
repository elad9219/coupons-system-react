import "./mainLayout.css";
import MyHeader from './myHeader/myHeader';
import Menu from './menu/menu';
import MyFooter from "./myFooter/myFooter";
import MenuRouting from '../routing/MenuRouting/MenuRouting';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, CssBaseline, Grid } from "@mui/material";

function MainLayout(): JSX.Element {
    const location = useLocation();

    useEffect(() => {
        localStorage.setItem('lastPath', location.pathname);
    }, [location]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }} dir="rtl">
            <CssBaseline />
            
            {/* Header */}
            <Box component="header" sx={{ zIndex: 1200 }}>
                <MyHeader/>
            </Box>

            <Grid container sx={{ flexGrow: 1, marginTop: '20px' }}>
                {/* Side Menu - 2/12 columns */}
                <Grid item xs={12} md={2} sx={{ 
                    borderLeft: '1px solid #e0e0e0', 
                    bgcolor: 'white',
                    minHeight: { md: '80vh' } 
                }}>
                    <Menu/>
                </Grid>

                {/* Main Content - 10/12 columns */}
                <Grid item xs={12} md={10} component="main" sx={{ p: 3 }}>
                    <MenuRouting/>
                </Grid>
            </Grid>

            {/* Footer */}
            <Box component="footer" sx={{ mt: 'auto' }}>
                <MyFooter/>
            </Box>
        </Box>
    );
}

export default MainLayout;