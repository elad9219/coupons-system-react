import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import {
    Box,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography
} from "@mui/material";

import AddBusinessOutlinedIcon from "@mui/icons-material/AddBusinessOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import { RootState } from "../../../redux/store";

interface MenuProps {
    onNavigate?: () => void;
}

interface MenuEntry {
    label: string;
    to: string;
    icon: JSX.Element;
}

interface MenuGroup {
    title: string;
    entries: MenuEntry[];
}

function Menu({ onNavigate }: MenuProps): JSX.Element {
    const userType = useSelector(
        (state: RootState) => state.authState.userType
    );

    const adminGroups: MenuGroup[] = [
        {
            title: "יצירה וניהול",
            entries: [
                {
                    label: "הוספת חברה",
                    to: "/admin/addCompany",
                    icon: <AddBusinessOutlinedIcon />
                },
                {
                    label: "הוספת לקוח",
                    to: "/admin/addCustomer",
                    icon: <PersonAddAltOutlinedIcon />
                }
            ]
        },
        {
            title: "מאגרי המערכת",
            entries: [
                {
                    label: "כל החברות",
                    to: "/admin/getAllCompanies",
                    icon: <StorefrontOutlinedIcon />
                },
                {
                    label: "כל הלקוחות",
                    to: "/admin/getAllCustomers",
                    icon: <PeopleAltOutlinedIcon />
                }
            ]
        },
        {
            title: "איתור רשומות",
            entries: [
                {
                    label: "חיפוש חברה לפי מזהה",
                    to: "/admin/getOneCompany",
                    icon: <SearchOutlinedIcon />
                },
                {
                    label: "חיפוש לקוח לפי מזהה",
                    to: "/admin/getCustomer",
                    icon: <SearchOutlinedIcon />
                }
            ]
        }
    ];

    const companyGroups: MenuGroup[] = [
        {
            title: "ניהול החברה",
            entries: [
                {
                    label: "יצירת קופון",
                    to: "/company/addCoupon",
                    icon: <AddCircleOutlineIcon />
                },
                {
                    label: "הקופונים שלי",
                    to: "/company/allCoupons",
                    icon: <LocalOfferOutlinedIcon />
                },
                {
                    label: "פרטי החברה",
                    to: "/company/getComapnyDetails",
                    icon: <StorefrontOutlinedIcon />
                }
            ]
        }
    ];

    const customerGroups: MenuGroup[] = [
        {
            title: "האזור האישי",
            entries: [
                {
                    label: "הקופונים שלי",
                    to: "/customer/customerCoupons",
                    icon: <LocalOfferOutlinedIcon />
                },
                {
                    label: "הפרופיל שלי",
                    to: "/customer/customerDetails",
                    icon: <PersonOutlineIcon />
                }
            ]
        }
    ];

    const groups =
        userType === "ADMIN"
            ? adminGroups
            : userType === "COMPANY"
                ? companyGroups
                : userType === "CUSTOMER"
                    ? customerGroups
                    : [];

    const roleLabel =
        userType === "ADMIN"
            ? "ניהול מערכת"
            : userType === "COMPANY"
                ? "חשבון חברה"
                : "חשבון לקוח";

    return (
        <Box
            component="nav"
            aria-label="ניווט ראשי"
            dir="rtl"
            sx={{
                width: "100%",
                height: "100%",
                px: 2,
                py: 3
            }}
        >
            <Box
                sx={{
                    px: 1.5,
                    pb: 2.5
                }}
            >
                <Typography
                    variant="overline"
                    sx={{
                        color: "text.secondary",
                        letterSpacing: 1,
                        fontWeight: 700
                    }}
                >
                    סביבת העבודה
                </Typography>

                <Typography
                    variant="h6"
                    sx={{
                        color: "text.primary",
                        fontWeight: 800
                    }}
                >
                    {roleLabel}
                </Typography>
            </Box>

            {groups.map((group, index) => (
                <Box key={group.title} sx={{ mb: 1.5 }}>
                    {index > 0 && (
                        <Divider sx={{ my: 2 }} />
                    )}

                    <Typography
                        variant="caption"
                        sx={{
                            display: "block",
                            px: 1.5,
                            mb: 1,
                            color: "text.secondary",
                            fontWeight: 800
                        }}
                    >
                        {group.title}
                    </Typography>

                    <List disablePadding>
                        {group.entries.map(entry => (
                            <ListItemButton
                                key={entry.to}
                                component={NavLink}
                                to={entry.to}
                                onClick={onNavigate}
                                sx={{
                                    mb: 0.5,
                                    px: 1.5,
                                    py: 1.15,
                                    borderRadius: 2.5,
                                    color: "text.secondary",
                                    textDecoration: "none",
                                    "&:hover": {
                                        bgcolor: "#F1F5FD",
                                        color: "primary.main"
                                    },
                                    "&.active": {
                                        bgcolor: "#EAF0FF",
                                        color: "primary.dark",
                                        fontWeight: 800
                                    },
                                    "&.active .MuiListItemIcon-root": {
                                        color: "primary.main"
                                    }
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 38,
                                        color: "inherit"
                                    }}
                                >
                                    {entry.icon}
                                </ListItemIcon>

                                <ListItemText
                                    primary={entry.label}
                                    primaryTypographyProps={{
                                        fontSize: 14,
                                        fontWeight: 650
                                    }}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                </Box>
            ))}
        </Box>
    );
}

export default Menu;