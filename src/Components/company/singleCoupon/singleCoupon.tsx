import "./singleCoupon.css";
import { Coupon } from '../../../modal/Coupon';
import { useNavigate } from "react-router-dom";
import { Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { store } from "../../../redux/store";
import { useState } from "react";
import jwtAxios from "../../../util/JWTaxios";
import notify from "../../../util/notify";
import globals from "../../../util/global";
import { deleteCoupon } from "../../../redux/couponState";
import advNotify from "../../../util/notify_advanced";

interface SingleCouponProps {
    coupon?: Coupon;
    updateCoupon: () => void;
    couponPurchased: boolean;
}

function SingleCoupon(props: SingleCouponProps): JSX.Element {
    const navigate = useNavigate();
    const [deleted, setDeleted] = useState(false);
    const [open, setOpen] = useState(false);
    const coupon = props.coupon;
    const [purchased, setPurchased] = useState(props.couponPurchased);

    if (!coupon) return <div>Loading...</div>;

    const isExpired = coupon.expired === true;

    const purchaseCoupon = () => {
        if (store.getState().authState.userType !== "CUSTOMER") {
            advNotify.error("עליך להתחבר כלקוח כדי לרכוש קופון");
            navigate("/login");
            return;
        }

        jwtAxios.post(globals.customer.purchaseCoupon + coupon.id)
            .then(response => {
                if (response.status < 300) {
                    notify.success("קופון " + coupon.title + " נרכש בהצלחה!");
                    setPurchased(true);
                    navigate(0); // refresh
                }
            })
            .catch(err => {
                notify.error("שגיאה – הקופון כבר נרכש או פג תוקף");
            });
    };

    const couponPurchased = store.getState().customerState.customer[0]?.coupons?.some(c => c.id === coupon.id) || purchased;

    const removeCoupon = () => {
        jwtAxios.delete(globals.company.deleteCoupon + coupon.id)
            .then(response => {
                if (response.status < 300) {
                    notify.success("קופון נמחק");
                    store.dispatch(deleteCoupon(coupon.id));
                    setDeleted(true);
                }
            });
    };

    const handleDeleteConfirm = () => {
        removeCoupon();
        setOpen(false);
    };

    const updateCoupon = () => {
        navigate("/company/updateCoupon", { state: { couponId: coupon.id } });
    };

    if (deleted) {
        navigate(0);
        return null;
    }

    return (
        <div className={`singleCoupon SolidBox ${isExpired ? 'expired' : ''}`} dir="rtl">
            <h3 style={{ textAlign: "center" }}>{coupon.title}</h3>
            <hr />

            {isExpired && (
                <div className="expired-badge">פג תוקף</div>
            )}

            {coupon.image && (
                <img src={coupon.image} alt={coupon.title} className="coupon-image" />
            )}

            <div className="coupon-details" style={{ opacity: isExpired ? 0.5 : 1 }}>
                <br />
                <b>ID:</b> {coupon.id} <br /><br />
                <b>קטגוריה:</b> {coupon.category} <br /><br />
                <b>תיאור:</b> {coupon.description || "אין תיאור"} <br /><br />
                {(store.getState().authState.userType === "COMPANY" || store.getState().authState.userType === "ADMIN") && (
                    <>
                        <b>כמות נותרה:</b> {coupon.amount} <br /><br />
                    </>
                )}
                <b>תחילת מבצע:</b> {coupon.start_date} <br /><br />
                <b>תוקף עד:</b> {coupon.end_date} <br /><br />
                <b>מחיר:</b> ₪{coupon.price} <br /><br />
            </div>

            {store.getState().authState.userType === "COMPANY" && !isExpired && (
                <ButtonGroup variant="contained" fullWidth>
                    <Button color="warning" onClick={updateCoupon}>עדכן קופון</Button>
                    <Button color="error" onClick={() => setOpen(true)}>מחק קופון</Button>
                </ButtonGroup>
            )}

            {(store.getState().authState.userType === "CUSTOMER" || store.getState().authState.userType === "") && !isExpired && (
                <Button variant="contained" color="primary" fullWidth onClick={purchaseCoupon} disabled={couponPurchased}>
                    {couponPurchased ? "כבר נרכש" : "רכוש קופון"}
                </Button>
            )}

            {isExpired && (
                <div className="expired-message">
                    קופון זה פג תוקף – לא ניתן לרכוש או לעדכן
                </div>
            )}

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>למחוק את הקופון "{coupon.title}"?</DialogTitle>
                <DialogContent>
                    <DialogContentText>פעולה זו בלתי הפיכה</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>ביטול</Button>
                    <Button onClick={handleDeleteConfirm} color="error">מחק</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default SingleCoupon;