import "./getAllCompanyCoupons2.css";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { store } from "../../../redux/store";
import { Coupon } from "../../../modal/Coupon";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import SingleCoupon from '../singleCoupon/singleCoupon';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { FormControl, InputLabel, Select, MenuItem, Grid, Typography, Paper, Container } from "@mui/material";
import { CouponCategory } from "../../../modal/CouponCategory";
import LoadingSpinner from "../../common/LoadingSpinner/LoadingSpinner";
import { getHebrewCategory } from "../../../util/categories";

function GetAllCompanyCoupons2(): JSX.Element {
    const navigate = useNavigate();
    const location = useLocation();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [maxPrice, setMaxPrice] = useState<number>(10000);
    const [category, setCategory] = useState<CouponCategory>(CouponCategory.ALL);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCoupons();
    }, [maxPrice, category]);

    const getCoupons = async () => {
        setLoading(true);
        try {
            let url = (category === CouponCategory.ALL) ? globals.company.getAllCoupons : `${globals.company.getCouponByCategory}/${category}`;
            const res = await jwtAxios.get<Coupon[]>(url);
            setCoupons(res.data.filter(c => c.price <= maxPrice));
        } catch { setCoupons([]); }
        setLoading(false);
    };

    if (loading && coupons.length === 0) return <LoadingSpinner />;

    return (
        <Container maxWidth="xl" sx={{ mt: 4 }} dir="rtl">
            <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">הקופונים שלי</Typography>
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={12} md={4}>
                        <Typography variant="body2">מחיר מקסימלי: ₪{maxPrice}</Typography>
                        <Slider value={maxPrice} min={0} max={10000} onChange={(_, v) => setMaxPrice(v as number)} valueLabelDisplay="auto" />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>קטגוריה</InputLabel>
                            <Select value={category} onChange={(e) => setCategory(e.target.value as CouponCategory)}>
                                <MenuItem value={CouponCategory.ALL}>הכל</MenuItem>
                                {Object.values(CouponCategory).filter(c => c !== "ALL").map(c => (
                                    <MenuItem key={c} value={c}>{getHebrewCategory(c)}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>
            <Grid container spacing={3}>
                {coupons.map(c => (
                    <Grid item key={c.id} xs={12} sm={6} md={4} lg={3}>
                        <SingleCoupon coupon={c} updateCoupon={() => navigate("/company/update", {state:{couponId:c.id}})} onDelete={(id) => setCoupons(coupons.filter(x => x.id !== id))} isOwned={true} />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}

export default GetAllCompanyCoupons2;