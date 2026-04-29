import "./mainLayout.css";
import MyHeader from './myHeader/myHeader';
import Menu from './menu/menu';
import MyFooter from "./myFooter/myFooter";
import MenuRouting from '../routing/MenuRouting/MenuRouting';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, CssBaseline, Grid } from "@mui/material";
import { store, RootState } from "../../redux/store"; 
import jwtAxios from "../../util/JWTaxios";
import globals from "../../util/global";
import { downloadSingleCustomer } from "../../redux/customerState";
import { downloadSingleCompany } from "../../redux/companyState";
import { setUserId, setUserName, userLogin } from "../../redux/authState";
import jwt_decode from "jwt-decode";
import { useSelector } from "react-redux"; 

function MainLayout(): JSX.Element {
    const location = useLocation();
    
    const userType = useSelector((state: RootState) => state.authState.userType);

    useEffect(() => {
        // Changed to sessionStorage
        sessionStorage.setItem('lastPath', location.pathname);
    }, [location]);

    useEffect(() => {
        // Changed to sessionStorage
        const token = sessionStorage.getItem("token");
        if (token) {
            store.dispatch(userLogin(token));
            try {
                const decoded: any = jwt_decode(token);
                const decodedUserType = decoded.userType; 
                
                if (decodedUserType === "CUSTOMER") {
                    jwtAxios.get(globals.customer.getCustomerDetails)
                        .then(res => {
                            store.dispatch(downloadSingleCustomer([res.data])); 
                            store.dispatch(setUserName(res.data.first_name));
                            store.dispatch(setUserId(res.data.id));
                        })
                        .catch(err => console.log("Error restoring customer data", err));
                } else if (decodedUserType === "COMPANY") {
                    jwtAxios.get(globals.company.getCompanyDetails)
                        .then(res => {
                            store.dispatch(downloadSingleCompany([res.data]));
                            store.dispatch(setUserName(res.data.name));
                            store.dispatch(setUserId(res.data.id));
                        })
                        .catch(err => console.log("Error restoring company data", err));
                } else if (decodedUserType === "ADMIN") {
                    store.dispatch(setUserName("Admin"));
                }
            } catch (e) {
                console.error("Token invalid");
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
                
                {userType && (
                    <Grid item xs={12} md={2} sx={{ 
                        borderLeft: '1px solid #e0e0e0', 
                        bgcolor: 'white',
                        minHeight: { md: '80vh' } 
                    }}>
                        <Menu/>
                    </Grid>
                )}

                <Grid item xs={12} md={userType ? 10 : 12} component="main" sx={{ p: 3 }}>
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