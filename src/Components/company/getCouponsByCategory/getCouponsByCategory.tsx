import "./getCouponsByCategory.css";
import { Button, InputLabel, MenuItem, Select } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Coupon } from "../../../modal/Coupon";
import { CouponCategory } from "../../../modal/CouponCategory";
import { store } from "../../../redux/store";
import globals from "../../../util/global";
import jwtAxios from "../../../util/JWTaxios";
import notify from "../../../util/notify";
import SingleCoupon from "../../company/singleCoupon/singleCoupon";
import { useNavigate } from "react-router-dom";
import advNotify from "../../../util/notify_advanced";

interface GetCoupon {
    category: CouponCategory;
}

function GetCouponsByCategory(): JSX.Element {
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const {register, handleSubmit} = useForm<GetCoupon>();
    
    useEffect(() => {
        if (store.getState().authState.userType!=="COMPANY") {
            advNotify.error("Please login...");
            navigate("/login");
        }
    },[]);

    const send = (data: GetCoupon) => {
        jwtAxios.get<Coupon[]>(globals.company.getCouponByCategory + data.category)
        .then(res => setCoupons(res.data))
        .catch(err => notify.error("Error getting coupons by category..."));
    }

    const handleUpdateNavigate = (couponId: number) => {
        navigate("/company/updateCoupon", { state: { couponId: couponId } });
    };

    return (
        <div className="getCouponsByCategory" dir="rtl">
            <h3>סינון קופונים לפי קטגוריה</h3>
            <form onSubmit={handleSubmit(send)}>
                <InputLabel id="category-label">קטגוריה</InputLabel>
                <Select
                    labelId="category-label"
                    fullWidth
                    {...register("category")}
                >
                    {Object.values(CouponCategory).map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
                <br /><br />
                <Button type="submit" variant="contained">סנן</Button>
            </form>
            <div className="CouponsList">
            {coupons.map(item=><SingleCoupon key={item.id} coupon={item} updateCoupon={() => handleUpdateNavigate(item.id)} 
            // FIX: Removed couponPurchased={false}
            />)}
            </div>
        </div>
    );
}

export default GetCouponsByCategory;