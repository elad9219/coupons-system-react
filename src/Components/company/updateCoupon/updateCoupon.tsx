import "./updateCoupon.css";
import { Typography, TextField, Button, ButtonGroup } from "@mui/material";
import { SyntheticEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { store } from "../../../redux/store";
import jwtAxios from '../../../util/JWTaxios';
import globals from "../../../util/global";
import notify from "../../../util/notify";
import { Coupon } from "../../../modal/Coupon";
import { updateCoupon } from "../../../redux/couponState";

function UpdateCoupon(): JSX.Element {
    const { register, handleSubmit, formState: { errors } } = useForm<Coupon>();
    const location = useLocation();
    const [coupon, setCoupon] = useState<Coupon | null>(null);
    const { couponId } = location.state as any;
    const navigate = useNavigate();

    useEffect(() => {
        setCoupon(store.getState().couponState.coupon.find(item => couponId == item.id));
    }, [couponId]);

    const send = () => {
        if (!coupon) return;
        jwtAxios.put(globals.company.updateCoupon, coupon)
            .then(response => {
                if (response.status < 300) {
                    notify.success(`עודכן בהצלחה קופון ${coupon.title}`);
                    navigate("/company/allCoupons");
                    store.dispatch(updateCoupon(coupon));
                }
            })
            .catch(err => {
                notify.error("בעיה בעדכון קופון");
                console.error(err);
            });
    };

    const titleChange = (e: SyntheticEvent) => {
        const newC = { ...coupon! };
        newC.title = (e.target as HTMLInputElement).value;
        setCoupon(newC);
    };
    const descriptionChange = (e: SyntheticEvent) => {
        const newC = { ...coupon! };
        newC.description = (e.target as HTMLInputElement).value;
        setCoupon(newC);
    };
    const start_dateChange = (e: SyntheticEvent) => {
        const newC = { ...coupon! };
        newC.start_date = (e.target as HTMLInputElement).value;
        setCoupon(newC);
    };
    const end_dateChange = (e: SyntheticEvent) => {
        const newC = { ...coupon! };
        newC.end_date = (e.target as HTMLInputElement).value;
        setCoupon(newC);
    };
    const amountChange = (e: SyntheticEvent) => {
        const newC = { ...coupon! };
        newC.amount = Number((e.target as HTMLInputElement).value);
        setCoupon(newC);
    };
    const priceChange = (e: SyntheticEvent) => {
        const newC = { ...coupon! };
        newC.price = Number((e.target as HTMLInputElement).value);
        setCoupon(newC);
    };
    const imageChange = (e: SyntheticEvent) => {
        const newC = { ...coupon! };
        newC.image = (e.target as HTMLInputElement).value;
        setCoupon(newC);
    };

    if (!coupon) return <div>Loading...</div>;

    return (
        <div className="updateCoupon SolidBox">
            <Typography variant="h4" className="HeadLine">עדכון קופון</Typography>
            <hr />
            <form onSubmit={handleSubmit(send)} style={{ marginTop: 20 }}>
                <TextField name="title" label="כותרת" variant="outlined" fullWidth
                    {...register("title", { required: { value: true, message: 'לא הוכנסה כותרת' } })}
                    value={coupon.title} onChange={titleChange} />
                <span>{errors.title?.message}</span><br/><br/>

                <TextField name="description" label="תיאור" variant="outlined" fullWidth
                    {...register("description")} value={coupon.description || ''} onChange={descriptionChange} />
                <span>{errors.description?.message}</span><br/><br/>

                <TextField type="date" name="start_date" label="תאריך תחילת קופון" variant="outlined" fullWidth
                    {...register("start_date", { required: { value: true, message: 'לא הוכנס תאריך' } })}
                    value={coupon.start_date} onChange={start_dateChange} />
                <span>{errors.start_date?.message}</span><br/><br/>

                <TextField type="date" name="end_date" label="תוקף קופון" variant="outlined" fullWidth
                    {...register("end_date", { required: { value: true, message: 'לא הוכנס תאריך' } })}
                    value={coupon.end_date} onChange={end_dateChange} />
                <span>{errors.end_date?.message}</span><br/><br/>

                {/* שדה כמות – עם onWheel על ה‑input */}
                <TextField
                    type="number"
                    name="amount"
                    label="כמות"
                    variant="outlined"
                    fullWidth
                    {...register("amount", { required: { value: true, message: 'לא הוכנסה כמות' } })}
                    value={coupon.amount}
                    onChange={amountChange}
                    inputProps={{ onWheel: (e) => e.currentTarget.blur() }}  // <-- פתרון מושלם
                />
                <span>{errors.amount?.message}</span><br/><br/>

                {/* שדה מחיר – עם onWheel על ה‑input */}
                <TextField
                    type="number"
                    name="price"
                    label="מחיר"
                    variant="outlined"
                    fullWidth
                    {...register("price", {
                        required: { value: true, message: 'לא הוכנס מחיר' },
                        min: { value: 1, message: "המחיר לא יכול להיות פחות מ‑1 ש״ח" },
                        max: { value: 9999, message: "המחיר לא יכול להיות גבוה מ‑9999" }
                    })}
                    value={coupon.price}
                    onChange={priceChange}
                    inputProps={{ onWheel: (e) => e.currentTarget.blur() }}  // <-- פתרון מושלם
                />
                <span>{errors.price?.message}</span><br/><br/>

                <TextField name="image" label="תמונה" variant="outlined" fullWidth
                    {...register("image", { required: { value: true, message: 'לא הוכנסה תמונה' } })}
                    value={coupon.image || ''} onChange={imageChange} />
                <span>{errors.image?.message}</span><br/><br/>

                <ButtonGroup variant="contained" fullWidth>
                    <Button type="submit" color="primary">עדכן קופון</Button>
                </ButtonGroup>
            </form>
        </div>
    );
}

export default UpdateCoupon;