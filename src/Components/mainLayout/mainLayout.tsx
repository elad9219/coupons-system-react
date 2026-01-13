import "./mainLayout.css";
import MyHeader from './myHeader/myHeader';
import Menu from './menu/menu';
import MyFooter from "./myFooter/myFooter";
import MenuRouting from '../routing/MenuRouting/MenuRouting';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, CssBaseline, Grid } from "@mui/material";
import { store } from "../../redux/store";
import jwtAxios from "../../util/JWTaxios";
import globals from "../../util/global";
import { downloadSingleCustomer } from "../../redux/customerState";
import { downloadSingleCompany } from "../../redux/companyState";
import { setUserId, setUserName, userLogin } from "../../redux/authState";
import jwt_decode from "jwt-decode";

function MainLayout(): JSX.Element {
    const location = useLocation();

    useEffect(() => {
        localStorage.setItem('lastPath', location.pathname);
    }, [location]);

    // Persistence Logic: Restore data on refresh - CRITICAL FOR BUTTON STATE
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            store.dispatch(userLogin(token));
            try {
                const decoded: any = jwt_decode(token);
                const userType = decoded.userType; 
                
                if (userType === "CUSTOMER") {
                    // Fetch full customer details (including coupons) immediately
                    jwtAxios.get(globals.customer.getCustomerDetails)
                        .then(res => {
                            // This payload MUST contain 'coupons' array for the button to be disabled
                            store.dispatch(downloadSingleCustomer([res.data])); 
                            store.dispatch(setUserName(res.data.first_name));
                            store.dispatch(setUserId(res.data.id));
                        })
                        .catch(err => console.error("Error restoring customer data", err));
                } else if (userType === "COMPANY") {
                    jwtAxios.get(globals.company.getCompanyDetails)
                        .then(res => {
                            store.dispatch(downloadSingleCompany([res.data]));
                            store.dispatch(setUserName(res.data.name));
                            store.dispatch(setUserId(res.data.id));
                        })
                        .catch(err => console.error("Error restoring company data", err));
                } else if (userType === "ADMIN") {
                    store.dispatch(setUserName("Admin"));
                }
            } catch (e) {
                console.error("Token restore failed");
            }
        }
    }, []);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }} dir="rtl">
            <CssBaseline />
            <Box component="header" sx={{ zIndex: 1200 }}>
                <MyHeader/>
            </Box>
            <Grid container sx={{ flexGrow: 1, marginTop: '20px' }}>
                <Grid item xs={12} md={2} sx={{ 
                    borderLeft: '1px solid #e0e0e0', 
                    bgcolor: 'white',
                    minHeight: { md: '80vh' } 
                }}>
                    <Menu/>
                </Grid>
                <Grid item xs={12} md={10} component="main" sx={{ p: 3 }}>
                    <MenuRouting/>
                </Grid>
            </Grid>
            <Box component="footer" sx={{ mt: 'auto' }}>
                <MyFooter/>
            </Box>
        </Box>
    );
}

export default MainLayout;