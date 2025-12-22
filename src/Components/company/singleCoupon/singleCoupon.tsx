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
import { format } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getHebrewCategory } from "../../../util/categories";

interface SingleCouponProps {
    coupon?: Coupon;
    updateCoupon?: () => void;
    onDelete?: (id: number) => void;
    isOwned?: boolean;
}

function SingleCoupon(props: SingleCouponProps): JSX.Element {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const coupon = props.coupon;
    const auth = store.getState().authState;
    
    if (!coupon) return <div></div>;

    const isExpired = coupon.expired;

    // Ownership and state checks
    const isCompanyOwner = auth.userType === "COMPANY" && coupon.companyId === auth.id;
    const isPurchasedByCustomer = auth.userType === "CUSTOMER" && 
        store.getState().customerState.customer[0]?.coupons?.some(c => c.id === coupon.id);

    const purchaseCoupon = () => {
        if (!auth.userType) {
            notify.error("עליך להתחבר כדי לרכוש קופון");
            navigate("/login");
            return;
        }
        jwtAxios.post(globals.customer.purchaseCoupon + coupon.id)
            .then(() => {
                notify.success("נרכש בהצלחה");
                navigate("/customer/customerCoupons");
            })
            .catch(err => notify.error(err.response?.data || "שגיאה ברכישה"));
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

    const goToUpdate = () => {
        // We use the function passed from the parent or navigate directly
        if (props.updateCoupon) {
            props.updateCoupon();
        } else {
            navigate("/company/updateCoupon", { state: { coupon: coupon } });
        }
    };

    return (
        <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            position: 'relative',
            borderRadius: 3,
            border: isExpired ? '1px solid #ffcdd2' : 'none'
        }} dir="rtl">
            
            {/* The Expired Chip - Placed outside the transparent box to stay bright red */}
            {isExpired && (
                <Chip 
                    label="פג תוקף" 
                    color="error" 
                    size="small" 
                    sx={{ 
                        position: 'absolute', 
                        top: 10, 
                        right: 10, 
                        zIndex: 2, 
                        fontWeight: 'bold',
                        boxShadow: 2
                    }} 
                />
            )}

            {/* Wrapper for content that should be dimmed when expired */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                opacity: isExpired ? 0.5 : 1, // Only content gets dimmed
                filter: isExpired ? 'grayscale(0.8)' : 'none'
            }}>
                <CardMedia 
                    component="img" 
                    height="150" 
                    image={coupon.image || "https://via.placeholder.com/200"} 
                    alt={coupon.title} 
                />

                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography variant="h6" sx={{fontWeight: 'bold', fontSize: '1.1rem'}}>{coupon.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{coupon.description}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" color="primary" fontWeight="bold">₪{coupon.price}</Typography>
                        <Chip label={getHebrewCategory(coupon.category)} size="small" variant="outlined" />
                    </Box>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        בתוקף עד: {format(new Date(coupon.end_date), 'dd/MM/yyyy')}
                    </Typography>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                    {!isExpired ? (
                        <>
                            {isCompanyOwner && (
                                <Box sx={{ width: '100%', display: 'flex', gap: 1 }}>
                                    <Button variant="outlined" startIcon={<EditIcon/>} onClick={goToUpdate} fullWidth>עדכן</Button>
                                    <IconButton color="error" onClick={() => setOpen(true)}><DeleteIcon /></IconButton>
                                </Box>
                            )}
                            {(auth.userType === "CUSTOMER" || !auth.userType) && (
                                <Button variant="contained" fullWidth onClick={purchaseCoupon} disabled={!!isPurchasedByCustomer}>
                                    {isPurchasedByCustomer ? "נרכש" : "רכישה"}
                                </Button>
                            )}
                        </>
                    ) : (
                        <Button variant="outlined" fullWidth disabled>לא זמין לרכישה</Button>
                    )}
                </CardActions>
            </Box>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>מחיקה</DialogTitle>
                <DialogContent><DialogContentText>למחוק את "{coupon.title}"?</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>ביטול</Button>
                    <Button onClick={() => { removeCoupon(); setOpen(false); }} color="error" variant="contained">מחק</Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}

export default SingleCoupon;