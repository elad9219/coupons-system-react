import "./singleCoupon.css";
import { Coupon } from '../../../modal/Coupon';
import { useNavigate } from "react-router-dom";
import { Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { store } from "../../../redux/store";
import { useEffect, useState } from "react";
import jwtAxios from "../../../util/JWTaxios";
import notify from "../../../util/notify";
import globals from "../../../util/global";
import { addCoupon, deleteCoupon } from "../../../redux/couponState";
import advNotify from "../../../util/notify_advanced";
import { updateCoupon } from "../../../redux/couponState";
import { updateCustomer } from "../../../redux/customerState";

interface SingleCouponProps {
    coupon? : Coupon;
    updateCoupon: () => void;
    couponPurchased: boolean;
}

function SingleCoupon(props: SingleCouponProps): JSX.Element {
    const navigate = useNavigate();
    const [deleted, setDeleted] = useState(false);
    const [open, setOpen] = useState(false);  
    const [coupon, setCoupon] = useState<Coupon | undefined>(props.coupon);
    const [userType, setUserType] = useState("");
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [purchased, setPurchased] = useState(props.couponPurchased);

    const purchaseCoupon = ()=> {
        if (store.getState().authState.userType!="CUSTOMER") {
            advNotify.error("עליך להתחבר למערכת לפני רכישת קופון");
            navigate("/login");
        } else {
        let couponId = props.coupon.id;
        console.log(store.getState().customerState.customer[0]?.coupons?.filter((
            item)=>item.id==props.coupon.id).length);
            console.log(store.getState().customerState.customer[0]?.coupons?.some((
                coupon) => coupon.id === props.coupon.id));
        jwtAxios.post(globals.customer.purchaseCoupon + couponId)
            .then(response => {
                if (response.status < 300) {
                notify.success("נרכש בהצלחה " + coupon.title + " קופון");
                setPurchased(true);
                let updatedCoupon = {...coupon, purchased: true};
                setCoupon(updatedCoupon);
                store.dispatch(updateCustomer(store.getState().customerState.customer[0]));
                navigate(+1);
                } else {
                notify.error("בעיה ברכישת קופון");
                }
            })
            .catch(err => {
                if (err.response && err.response.status === 400) {
                    notify.error("אפשר לרכוש כל קופון רק פעם אחת.");
                }
                throw err;
            })
        }
    };

    const couponPurchased = store.getState().customerState.customer[0]?.coupons?.filter((
        item)=>item.id==props.coupon.id).length > 0;

    const removeCoupon = (): Promise<void> => {
        return jwtAxios.delete(globals.company.deleteCoupon+props.coupon.id)
            .then(response=>{
                if (response.status<300) {
                    notify.success("נמחק " + props.coupon.title + " קופון");
                    store.dispatch(deleteCoupon(props.coupon.id));
                    setDeleted(true);
                }
            })
            .catch((error) => {
                if (error.response && error.response.status === 500) {
                    notify.error("בעיה במחיקת קופון. נסה שוב מאוחר יותר.");
                }
                throw error;
            });
    };

    const handleDeleteYes = () => {
        setOpen(true);
    };
   
        const handleDeleteConfirm = () => {
            removeCoupon()
            .then(() => {
                setDeleted(true);
                setOpen(false);
            })
            .catch(() => {
                setOpen(false);
            });
        };
   
        const handleDeleteNo = () => {
            setOpen(false);
        };

   
   
        const updateCoupon = () => {
            navigate("/company/updateCoupon", { state: { couponId: props.coupon.id } });
        };
   
   
        if (deleted) {
            navigate(+1); 
            return null;
        }

   
        if (!props.coupon) {
            return <div>Loading...</div>;
        }
   
    return (
        <div className="singleCoupon SolidBox" dir="rtl">
            <h3 style={{textAlign:"center"}} dir="rtl"> {props.coupon.title}</h3> <hr/><br />
            <b>id:</b> {props.coupon.id} <br /><br />
            <b>קטגוריה:</b> {props.coupon.category}  <br /><br />
            <b>תיאור:</b> {props.coupon.description} <br /><br/>
            {store.getState().authState.userType==="ADMIN" || store.getState().authState.userType === "COMPANY"? 
            <div>
            <b>כמות:</b> {props.coupon.amount} <br /><br/>
            </div>
            :""}
            <b>תאריך תחילת קופון:</b> {props.coupon.start_date} <br /><br/>
            <b>תוקף קופון:</b> {props.coupon.end_date} <br /><br/>
            <b>מחיר:</b> ₪ {props.coupon.price} <br /><br/>
            <b>תמונה:</b> {props.coupon.image} <br /><br/>
            {store.getState().authState.userType === "COMPANY"?
            <ButtonGroup variant="contained" fullWidth>
                <Button color="warning" onClick={updateCoupon}>עדכן קופון</Button>
                <div>
                    <Button color="error" dir="rtl" style={{width:100}} fullWidth onClick={handleDeleteYes}>מחיקת קופון</Button>
                    <Dialog
                        open={open}
                        onClose={handleDeleteNo}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">
                            {"?"+props.coupon.title+ " האם אתה בטוח שברצונך למחוק את קופון"}
                        </DialogTitle>
                        <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                        לא ניתן לשחזר את הקופון לאחר המחיקה.
                        הקופון יימחק גם אצל הלקוח, אבל הוא יוכל לממש את הקופון דרך המייל שלו
                        </DialogContentText>
                        </DialogContent>
                        <DialogActions style={{ justifyContent: "center" }}>
                        <Button color="inherit" style={{width:"100px"}} onClick={handleDeleteNo}>ביטול</Button>
                        <Button color="error" style={{width:"100px"}} onClick={handleDeleteConfirm} autoFocus>
                            למחוק
                        </Button>
                        </DialogActions>
                    </Dialog>
                    </div>
            </ButtonGroup>
            :""}
   
            {store.getState().authState.userType === "" || store.getState().authState.userType === "CUSTOMER"  ?
                <ButtonGroup variant="contained" fullWidth>
                    <Button color="primary" onClick={purchaseCoupon}
                        disabled={couponPurchased || purchased}
                        > {couponPurchased || purchased ? (
                            <span>ניתן לרכוש רק קופון אחד</span>
                        ) : (
                            <span>רכישת קופון</span>
                        )}</Button>
                </ButtonGroup>
                :
                ""} 
            </div>
    );
}

export default SingleCoupon;