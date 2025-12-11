import "./getCouponsByMaxPrice.css";
import { Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Coupon } from "../../../modal/Coupon";
import { store } from "../../../redux/store";
import globals from "../../../util/global";
import jwtAxios from "../../../util/JWTaxios";
import notify from "../../../util/notify";
import SingleCoupon from "../../company/singleCoupon/singleCoupon";
import { useNavigate } from "react-router-dom";
import advNotify from "../../../util/notify_advanced";

interface GetCoupon {
    maxPrice: number;
}

function GetCouponsByMaxPrice(): JSX.Element {
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
        jwtAxios.get<Coupon[]>(globals.company.getCouponByMaxPrice + data.maxPrice)
        .then(res => setCoupons(res.data))
        .catch(err => notify.error("Error getting coupons by max price..."));
    }

    const handleUpdateNavigate = (couponId: number) => {
        navigate("/company/updateCoupon", { state: { couponId: couponId } });
    };

    return (
        <div className="getCouponsByMaxPrice" dir="rtl">
            <h3>סינון קופונים עד מחיר</h3>
            <form onSubmit={handleSubmit(send)}>
                <TextField type="number" label="מחיר מקסימלי" fullWidth {...register("maxPrice")} />
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

export default GetCouponsByMaxPrice;