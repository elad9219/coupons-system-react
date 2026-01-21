import "./singleCoupon.css";
import { Coupon } from '../../../modal/Coupon';
import { useNavigate } from "react-router-dom";
import { 
    Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, 
    Card, CardMedia, CardContent, Typography, CardActions, Chip, Box, IconButton 
} from "@mui/material";
import { store, RootState } from "../../../redux/store";
import { useState } from "react";
import jwtAxios from "../../../util/JWTaxios";
import notify from "../../../util/notify";
import globals from "../../../util/global";
import { deleteCoupon } from "../../../redux/couponState";
import { format } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getHebrewCategory } from "../../../util/categories";
import { useSelector, useDispatch } from "react-redux";
import { couponPurchased } from "../../../redux/customerState";

interface SingleCouponProps {
    coupon?: Coupon;
    updateCoupon?: () => void;
    onDelete?: (id: number) => void;
    isOwned?: boolean; 
}

function SingleCoupon(props: SingleCouponProps): JSX.Element {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const [openDelete, setOpenDelete] = useState(false);
    const [openPurchase, setOpenPurchase] = useState(false);

    const coupon = props.coupon;
    
    // Selectors
    const userType = useSelector((state: RootState) => state.authState.userType);
    const userId = useSelector((state: RootState) => state.authState.id);
    const customer = useSelector((state: RootState) => state.customerState.customer[0]);
    
    // Logic checks
    if (!coupon) return <div></div>;

    // Fixed: Checking if purchased via Prop or Redux state
    const isPurchasedByCustomer = props.isOwned || (userType === "CUSTOMER" && 
                                  customer?.coupons?.some(c => Number(c.id) === Number(coupon?.id)));

    // Fixed: Calculating expiration based on end_date
    const isExpired = new Date(coupon.end_date) < new Date();
    
    // New: Checking if out of stock
    const isOutOfStock = coupon.amount <= 0;

    const isCompanyOwner = userType === "COMPANY" && coupon.companyId === userId;

    const confirmPurchase = () => {
        if (!userType) {
            notify.error("עליך להתחבר כדי לרכוש קופון");
            navigate("/login");
            return;
        }
        setOpenPurchase(true);
    };

    const performPurchase = () => {
        jwtAxios.post(globals.customer.purchaseCoupon + coupon.id)
            .then(() => {
                notify.success("נרכש בהצלחה!");
                dispatch(couponPurchased(coupon));
                setOpenPurchase(false);
            })
            .catch(err => {
                const errorMsg = err.response?.data?.message || err.response?.data || "שגיאה ברכישה";
                notify.error(errorMsg);
                setOpenPurchase(false);
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

    const goToUpdate = () => {
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
            border: isExpired ? '1px solid #ffcdd2' : 'none',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'scale(1.02)' }
        }} dir="rtl">

            {isExpired && (
                <Chip 
                    label="פג תוקף" 
                    color="error" 
                    size="small" 
                    sx={{ position: 'absolute', top: 10, right: 10, zIndex: 2, fontWeight: 'bold', boxShadow: 2 }} 
                />
            )}

            <Box sx={{ 
                display: 'flex', flexDirection: 'column', height: '100%',
                opacity: isExpired ? 0.6 : 1, 
                filter: isExpired ? 'grayscale(0.8)' : 'none'
            }}>
                <CardMedia
                    component="img"
                    height="180"
                    image={coupon.image || "https://via.placeholder.com/200"}
                    alt={coupon.title}
                />

                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem', lineHeight: 1.2, mb: 1 }}>
                        {coupon.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '40px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {coupon.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                        <Typography variant="h6" color="primary" fontWeight="bold">₪{coupon.price}</Typography>
                        <Chip label={getHebrewCategory(coupon.category)} size="small" variant="outlined" />
                    </Box>
                    <Typography variant="caption" display="block" sx={{ mt: 1, color: '#888' }}>
                        בתוקף עד: {format(new Date(coupon.end_date), 'dd/MM/yyyy')}
                    </Typography>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                    {!isExpired ? (
                        <>
                            {isCompanyOwner && (
                                <Box sx={{ width: '100%', display: 'flex', gap: 1 }}>
                                    <Button variant="outlined" startIcon={<EditIcon />} onClick={goToUpdate} fullWidth>עדכן</Button>
                                    <IconButton color="error" onClick={() => setOpenDelete(true)}><DeleteIcon /></IconButton>
                                </Box>
                            )}
                            {(userType === "CUSTOMER" || !userType) && (
                                <Button 
                                    variant="contained" 
                                    fullWidth 
                                    onClick={confirmPurchase} 
                                    // Disabled if already purchased OR out of stock
                                    disabled={!!isPurchasedByCustomer || isOutOfStock} 
                                    color={isPurchasedByCustomer ? "success" : "primary"}
                                    sx={{ fontWeight: 'bold' }}
                                >
                                    {isPurchasedByCustomer ? "נרכש" : isOutOfStock ? "אזל המלאי" : "רכישה"}
                                </Button>
                            )}
                        </>
                    ) : (
                        <Button variant="outlined" fullWidth disabled sx={{ borderColor: '#ddd', color: '#aaa' }}>לא זמין לרכישה</Button>
                    )}
                </CardActions>
            </Box>

            {/* Delete Dialog */}
            <Dialog open={openDelete} onClose={() => setOpenDelete(false)} dir="rtl">
                <DialogTitle>מחיקת קופון</DialogTitle>
                <DialogContent><DialogContentText>למחוק את "{coupon.title}"?</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDelete(false)}>ביטול</Button>
                    <Button onClick={() => { removeCoupon(); setOpenDelete(false); }} color="error" variant="contained">מחק</Button>
                </DialogActions>
            </Dialog>

            {/* Purchase Dialog */}
            <Dialog open={openPurchase} onClose={() => setOpenPurchase(false)} dir="rtl">
                <DialogTitle sx={{fontWeight: 'bold'}}>אישור רכישה</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        האם לרכוש את הקופון <b>{coupon.title}</b> במחיר <b>₪{coupon.price}</b>?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPurchase(false)} variant="outlined" color="inherit">ביטול</Button>
                    <Button onClick={performPurchase} variant="contained" color="primary">אישור ורכישה</Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}

export default SingleCoupon;