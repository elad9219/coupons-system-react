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
import { downloadSingleCustomer } from "../../../redux/customerState";

interface SingleCouponProps {
    coupon?: Coupon;
    updateCoupon?: () => void;
    onDelete?: (id: number) => void;
    isOwned?: boolean; // נשמר למקרה הצורך, אבל הלוגיקה האמיתית עכשיו דרך Redux
}

function SingleCoupon(props: SingleCouponProps): JSX.Element {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    // Dialog States
    const [openDelete, setOpenDelete] = useState(false);
    const [openPurchase, setOpenPurchase] = useState(false);

    const coupon = props.coupon;
    
    // שימוש ב-Selectors כדי להאזין לשינויים בזמן אמת
    const userType = useSelector((state: RootState) => state.authState.userType);
    const userId = useSelector((state: RootState) => state.authState.id);
    
    // בדיקה ריאקטיבית האם הקופון נרכש (מתעדכן אוטומטית כשהסטייט משתנה)
    const customerCoupons = useSelector((state: RootState) => state.customerState.customer[0]?.coupons);
    const isPurchasedByCustomer = userType === "CUSTOMER" && customerCoupons?.some(c => c.id === coupon?.id);

    if (!coupon) return <div></div>;

    const isExpired = coupon.expired;
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
                // עדכון הסטייט ב-Redux כדי שהכפתור יהפוך ל"נרכש" מיד
                // אנו מורידים מחדש את פרטי הלקוח כדי לסנכרן את הקופונים
                jwtAxios.get(globals.customer.getCustomerDetails).then(res => {
                    dispatch(downloadSingleCustomer([res.data]));
                });
                setOpenPurchase(false);
            })
            .catch(err => {
                notify.error(err.response?.data || "שגיאה ברכישה");
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

            {/* Expired Badge */}
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
                    height="160"
                    image={coupon.image || "https://via.placeholder.com/200"}
                    alt={coupon.title}
                />

                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem', lineHeight: 1.2, mb: 1 }}>
                        {coupon.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '40px' }}>
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
                                    disabled={!!isPurchasedByCustomer} // הופך ל-True מיד כשהסטייט מתעדכן
                                    color={isPurchasedByCustomer ? "success" : "primary"}
                                >
                                    {isPurchasedByCustomer ? "נרכש" : "רכישה"}
                                </Button>
                            )}
                        </>
                    ) : (
                        <Button variant="outlined" fullWidth disabled sx={{ borderColor: '#ddd', color: '#aaa' }}>לא זמין לרכישה</Button>
                    )}
                </CardActions>
            </Box>

            {/* דיאלוג מחיקה */}
            <Dialog open={openDelete} onClose={() => setOpenDelete(false)} dir="rtl">
                <DialogTitle>מחיקת קופון</DialogTitle>
                <DialogContent><DialogContentText>למחוק את "{coupon.title}"?</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDelete(false)}>ביטול</Button>
                    <Button onClick={() => { removeCoupon(); setOpenDelete(false); }} color="error" variant="contained">מחק</Button>
                </DialogActions>
            </Dialog>

            {/* דיאלוג אישור רכישה - חדש! */}
            <Dialog open={openPurchase} onClose={() => setOpenPurchase(false)} dir="rtl">
                <DialogTitle sx={{fontWeight: 'bold'}}>אישור רכישה</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        האם אתה בטוח שברצונך לרכוש את הקופון <b>{coupon.title}</b> במחיר <b>₪{coupon.price}</b>?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{p: 2}}>
                    <Button onClick={() => setOpenPurchase(false)} variant="outlined" color="inherit">ביטול</Button>
                    <Button onClick={performPurchase} variant="contained" color="primary">אישור ורכישה</Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}

export default SingleCoupon;