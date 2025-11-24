import "./getAllCompanyCoupons.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { store } from "../../../redux/store";
import advNotify from "../../../util/notify_advanced";
import { Coupon } from "../../../modal/Coupon";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import SingleCoupon from '../singleCoupon/singleCoupon';
import notify from "../../../util/notify";

function GetAllCompanyCoupons(): JSX.Element {
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState<Coupon[]>([]);

    useEffect(() => {
        if (store.getState().authState.userType !== "COMPANY") {
            advNotify.error("Please login...");
            navigate("/login");
        }
        setCoupons(store.getState().couponState.coupon);
    }, []);

    return (
        <div className="getAllCompanyCoupons">
            <div className="solid">
                <h1>הקופונים של החברה</h1> <hr />
                {coupons.map(item => <SingleCoupon key={item.id} coupon={item} updateCoupon={function (): void {
                    throw new Error("Function not implemented.");
                }} couponPurchased={false} />)}
            </div>
        </div>
    );
}

export default GetAllCompanyCoupons;