import "./singleCoupon.css"; 
import { Coupon } from '../../../modal/Coupon';
import { useNavigate } from "react-router-dom";
import { 
    Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Card, CardMedia, CardContent, Typography, CardActions, Chip, Box, IconButton
} from "@mui/material";
import { store } from "../../../redux/store";
import { useState } from "react";
import jwtAxios from "../../../util/JWTaxios";
import notify from "../../../util/notify";
import globals from "../../../util/global";
import { deleteCoupon } from "../../../redux/couponState";
import advNotify from "../../../util/notify_advanced";
import { format } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getHebrewCategory } from "../../../util/categories";

interface SingleCouponProps {
    coupon?: Coupon;
    updateCoupon: () => void;
    onDelete?: (id: number) => void;
    isOwned?: boolean; 
}

function SingleCoupon(props: SingleCouponProps): JSX.Element {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const coupon = props.coupon;
    const userType = store.getState().authState.userType;

    // Logic: If user is customer, check if he already owns this coupon
    const isPurchasedByCustomer = userType === "CUSTOMER" && 
        store.getState().customerState.customer[0]?.coupons?.some(c => c.id === coupon?.id);

    if (!coupon) return <div></div>;

    const isExpired = coupon.expired;

    const purchaseCoupon = () => {
        // GUEST Handling: Check immediately and redirect
        if (!userType) {
            advNotify.error("עליך להתחבר לאתר כדי לרכוש קופון");
            navigate("/login");
            return;
        }

        if (userType !== "CUSTOMER") {
            advNotify.error("רק לקוחות יכולים לרכוש קופונים");
            return;
        }

        jwtAxios.post(globals.customer.purchaseCoupon + coupon.id)
            .then(response => {
                notify.success(`קופון ${coupon.title} נרכש בהצלחה!`);
                navigate("/customer/customerCoupons");
            })
            .catch(err => {
                notify.error(err.response?.data || "שגיאה ברכישת הקופון");
            });
    };

    const removeCoupon = () => {
        jwtAxios.delete(globals.company.deleteCoupon + coupon.id)
            .then(() => {
                notify.success("קופון נמחק");
                store.dispatch(deleteCoupon(coupon.id));
                if (props.onDelete) props.onDelete(coupon.id);
            })
            .catch(() => notify.error("שגיאה במחיקה"));
    };

    return (
        <Card sx={{ 
            height: '100%', display: 'flex', flexDirection: 'column', position: 'relative',
            opacity: isExpired ? 0.6 : 1, transition: '0.2s', borderRadius: 3,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
        }} dir="rtl">
            
            {/* Expired Label - Restored */}
            {isExpired && (
                <Chip 
                    label="פג תוקף" 
                    color="error" 
                    size="small" 
                    sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1, fontWeight: 'bold' }} 
                />
            )}
            
            <CardMedia
                component="img"
                height="150"
                image={coupon.image || "https://via.placeholder.com/200"}
                alt={coupon.title}
            />
            
            <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Typography gutterBottom variant="h6" component="div" sx={{lineHeight: 1.2, fontSize: '1.1rem', fontWeight: 'bold'}}>
                    {coupon.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, height: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {coupon.description}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                        ₪{coupon.price}
                    </Typography>
                    <Chip label={getHebrewCategory(coupon.category)} size="small" variant="outlined" />
                </Box>
                
                <Typography variant="caption" display="block" sx={{ mt: 1, color: '#777' }}>
                    בתוקף עד: {format(new Date(coupon.end_date), 'dd/MM/yyyy')}
                </Typography>

                {userType === "ADMIN" && (
                    <Typography variant="caption" display="block" sx={{ color: '#999' }}>ID: {coupon.id}</Typography>
                )}
            </CardContent>

            <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                
                {/* COMPANY ACTIONS: Only inside My Coupons */}
                {userType === "COMPANY" && props.isOwned && !isExpired && (
                    <Box sx={{ width: '100%', display: 'flex', gap: 1 }}>
                        <Button variant="outlined" size="small" startIcon={<EditIcon/>} onClick={props.updateCoupon} fullWidth>
                            עדכן
                        </Button>
                        <IconButton color="error" size="small" onClick={() => setOpen(true)}>
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                )}

                {/* CUSTOMER / GUEST ACTIONS */}
                {(!props.isOwned && (userType === "CUSTOMER" || !userType) && !isExpired) && (
                    <Button 
                        variant="contained" 
                        fullWidth 
                        onClick={purchaseCoupon} 
                        // Disable if already purchased
                        disabled={isPurchasedByCustomer as boolean || coupon.amount === 0}
                        color={isPurchasedByCustomer ? "success" : "primary"}
                        startIcon={isPurchasedByCustomer ? <CheckCircleIcon sx={{ml:1}}/> : <ShoppingCartIcon sx={{ml:1}}/>}
                    >
                        {coupon.amount === 0 ? "אזל" : (isPurchasedByCustomer ? "נרכש" : "רכישה")}
                    </Button>
                )}

                {/* ALREADY OWNED LABEL (Inside My Coupons) */}
                {props.isOwned && userType === "CUSTOMER" && (
                    <Button variant="contained" disabled fullWidth color="success" startIcon={<CheckCircleIcon sx={{ml:1}}/>}>
                        נרכש
                    </Button>
                )}
            </CardActions>

            <Dialog open={open} onClose={() => setOpen(false)} dir="rtl">
                <DialogTitle>מחיקת קופון</DialogTitle>
                <DialogContent>
                    <DialogContentText>האם למחוק את קופון "{coupon.title}"?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>ביטול</Button>
                    <Button onClick={() => { removeCoupon(); setOpen(false); }} color="error" variant="contained">מחק</Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}

export default SingleCoupon;