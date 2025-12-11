import "./getAllCompanyCoupons.css";
import { useEffect, useState } from "react";
import { Coupon } from "../../../modal/Coupon";
import { store } from "../../../redux/store";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import SingleCoupon from "../singleCoupon/singleCoupon";
import { useNavigate } from "react-router-dom";
import advNotify from "../../../util/notify_advanced";
import { Container, Typography } from "@mui/material";

function GetAllCompanyCoupons(): JSX.Element {
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState<Coupon[]>([]);

    useEffect(() => {
        if (store.getState().authState.userType!=="COMPANY") {
            advNotify.error("Please login...");
            navigate("/login");
        }
        jwtAxios.get<Coupon[]>(globals.company.getAllCoupons)
        .then(res => setCoupons(res.data))
        .catch(err => advNotify.error("Error getting coupons..."));
    }, []);

    const handleUpdateNavigate = (couponId: number) => {
        navigate("/company/updateCoupon", { state: { couponId: couponId } });
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h5" align="center" gutterBottom>כל הקופונים שלי</Typography>
            <div className="CouponsList">
                {coupons.map(item => (
                    <SingleCoupon 
                        key={item.id} 
                        coupon={item} 
                        updateCoupon={() => handleUpdateNavigate(item.id)} 
                        // FIX: Removed couponPurchased={false}
                    />
                ))}
            </div>
        </Container>
    );
}

export default GetAllCompanyCoupons;