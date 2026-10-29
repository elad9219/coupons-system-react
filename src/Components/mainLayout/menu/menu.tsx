import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography
} from "@mui/material";

import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import StoreIcon from "@mui/icons-material/Store";
import PeopleIcon from "@mui/icons-material/People";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";

import { RootState } from "../../../redux/store";

function Menu(): JSX.Element {
    const userType = useSelector(
        (state: RootState) => state.authState.userType
    );

    const linkStyle = {
        textDecoration: "none",
        color: "inherit",
        width: "100%"
    };

    return (
        <div className="menu">
            {userType === "ADMIN" && (
                <List>
                    <ListItem disablePadding>
                        <Typography
                            variant="subtitle2"
                            sx={{ p: 2, color: "gray", fontWeight: "bold" }}
                        >
                            פעולות אדמין
                        </Typography>
                    </ListItem>

                    <NavLink to="admin/addCompany" style={linkStyle}>
                        <ListItemButton>
                            <ListItemIcon><AddBusinessIcon /></ListItemIcon>
                            <ListItemText primary="הוספת חברה" />
                        </ListItemButton>
                    </NavLink>

                    <NavLink to="admin/addCustomer" style={linkStyle}>
                        <ListItemButton>
                            <ListItemIcon><PersonAddIcon /></ListItemIcon>
                            <ListItemText primary="הוספת לקוח" />
                        </ListItemButton>
                    </NavLink>

                    <Divider sx={{ my: 1 }} />

                    <NavLink to="admin/getAllCompanies" style={linkStyle}>
                        <ListItemButton>
                            <ListItemIcon><StoreIcon /></ListItemIcon>
                            <ListItemText primary="כל החברות" />
                        </ListItemButton>
                    </NavLink>

                    <NavLink to="admin/getAllCustomers" style={linkStyle}>
                        <ListItemButton>
                            <ListItemIcon><PeopleIcon /></ListItemIcon>
                            <ListItemText primary="כל הלקוחות" />
                        </ListItemButton>
                    </NavLink>

                    <Divider sx={{ my: 1 }} />

                    <NavLink to="admin/getOneCompany" style={linkStyle}>
                        <ListItemButton>
                            <ListItemIcon><SearchIcon /></ListItemIcon>
                            <ListItemText primary="חיפוש חברה (ID)" />
                        </ListItemButton>
                    </NavLink>

                    <NavLink to="admin/getCustomer" style={linkStyle}>
                        <ListItemButton>
                            <ListItemIcon><SearchIcon /></ListItemIcon>
                            <ListItemText primary="חיפוש לקוח (ID)" />
                        </ListItemButton>
                    </NavLink>
                </List>
            )}

            {userType === "COMPANY" && (
                <List>
                    <ListItem disablePadding>
                        <Typography
                            variant="subtitle2"
                            sx={{ p: 2, color: "gray", fontWeight: "bold" }}
                        >
                            ניהול חברה
                        </Typography>
                    </ListItem>

                    <NavLink to="company/addCoupon" style={linkStyle}>
                        <ListItemButton>
                            <ListItemIcon><AddBusinessIcon /></ListItemIcon>
                            <ListItemText primary="יצירת קופון" />
                        </ListItemButton>
                    </NavLink>

                    <NavLink to="company/allCoupons" style={linkStyle}>
                        <ListItemButton>
                            <ListItemIcon><LocalOfferIcon /></ListItemIcon>
                            <ListItemText primary="הקופונים שלי" />
                        </ListItemButton>
                    </NavLink>

                    <NavLink to="company/getComapnyDetails" style={linkStyle}>
                        <ListItemButton>
                            <ListItemIcon><StoreIcon /></ListItemIcon>
                            <ListItemText primary="פרטי החברה" />
                        </ListItemButton>
                    </NavLink>
                </List>
            )}

            {userType === "CUSTOMER" && (
                <List>
                    <ListItem disablePadding>
                        <Typography
                            variant="subtitle2"
                            sx={{ p: 2, color: "gray", fontWeight: "bold" }}
                        >
                            אזור אישי
                        </Typography>
                    </ListItem>

                    <NavLink to="customer/customerCoupons" style={linkStyle}>
                        <ListItemButton>
                            <ListItemIcon><LocalOfferIcon /></ListItemIcon>
                            <ListItemText primary="הקופונים שלי" />
                        </ListItemButton>
                    </NavLink>

                    <NavLink to="customer/customerDetails" style={linkStyle}>
                        <ListItemButton>
                            <ListItemIcon><PersonIcon /></ListItemIcon>
                            <ListItemText primary="הפרופיל שלי" />
                        </ListItemButton>
                    </NavLink>
                </List>
            )}
        </div>
    );
}

export default Menu;