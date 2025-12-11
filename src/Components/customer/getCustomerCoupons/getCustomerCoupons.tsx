import { FormControl, InputLabel, MenuItem, Select, Slider, Grid, Typography, Paper, Container } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Coupon } from "../../../modal/Coupon";
import { CouponCategory } from "../../../modal/CouponCategory";
import { store } from "../../../redux/store";
import globals from "../../../util/global";
import jwtAxios from "../../../util/JWTaxios";
import SingleCoupon from "../../company/singleCoupon/singleCoupon";
import "./getCustomerCoupons.css"; // Re-adding CSS import

// Hebrew Mapping
const categoryHebrew: Record<string, string> = {
    "FOOD": "אוכל",
    "VACATION": "חופשה",
    "HOTELS": "מלונות",
    "ELECTRICITY": "חשמל",
    "RESTAURANT": "מסעדות",
    "SPA": "ספא",
    "ATTRACTIONS": "אטרקציות",
    "CLOTHING": "ביגוד",
    "BOWLING": "באולינג",
    "OTHER": "אחר",
    "ALL": "הכל"
};

function GetCustomerCoupons(): JSX.Element {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [maxPrice, setMaxPrice] = useState<number>(10000);
    const [category, setCategory] = useState<CouponCategory>(CouponCategory.ALL);
    const location = useLocation();

    useEffect(() => {
        getCoupons();
    }, [maxPrice, category]);

    async function getCouponsByCategoryAndPrice(category: CouponCategory, maxPrice: number): Promise<Coupon[]> {
        let response;
        if (category === CouponCategory.ALL) {
            response = await jwtAxios.get<Coupon[]>(globals.customer.getAllCoupons);
        } else {
            response = await jwtAxios.get<Coupon[]>(`${globals.customer.getCouponsByCategory}/${category}`);
        }
        return response.data.filter(coupon => coupon.price <= maxPrice);
    }

    const getCoupons = async () => {
            try {
            // Logic for Admin viewing a customer's coupons
            if (store.getState().authState.userType === "ADMIN" && location.state && (location.state as any).customerId) {
                const { customerId } = location.state as any;
                const customer = store.getState().customerState.customer.find(item => customerId === item.id);
                    if (customer && customer.coupons) {
                    const filtered = customer.coupons.filter(coupon => 
                        coupon.price <= maxPrice && 
                        (category === CouponCategory.ALL || coupon.category === category)
                    );
                    setCoupons(filtered);
                } else {
                    setCoupons([]);
                }
            } 
            // Logic for Customer viewing his own coupons
            else if (store.getState().authState.userType === "CUSTOMER") {
                const data = await getCouponsByCategoryAndPrice(category, maxPrice);
                setCoupons(data);
            } else {
                setCoupons([]);
            }
        } catch (error) {
            setCoupons([]);
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
                הקופונים שלי
            </Typography>

            <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                <Grid container spacing={4} alignItems="center" justifyContent="center">
                    <Grid item xs={12} md={4}>
                        <Typography gutterBottom variant="body2">מחיר מקסימלי: ₪{maxPrice}</Typography>
                        <Slider
                            value={maxPrice}
                            min={0}
                            max={10000}
                            step={50}
                            onChange={(_, val) => setMaxPrice(val as number)}
                            valueLabelDisplay="auto"
                            sx={{direction: 'ltr'}} // Slider direction fix
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>קטגוריה</InputLabel>
                            <Select
                                value={category}
                                label="קטגוריה"
                                onChange={(e) => setCategory(e.target.value as CouponCategory)}
                            >
                                {Object.values(CouponCategory).map(cat => (
                                    <MenuItem key={cat} value={cat} dir="rtl">
                                        {categoryHebrew[cat] || cat}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={3}>
                {coupons.map(item => (
                    <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
                        <SingleCoupon 
                            coupon={item} 
                            updateCoupon={() => {}} 
                            // FIX: Changed from couponPurchased={true}
                            isOwned={true} // Tells the card this is "My Coupon" and hides the purchase button
                        />
                    </Grid>
                ))}
            </Grid>
            
            {coupons.length === 0 && (
                <Typography align="center" sx={{ mt: 4, color: 'gray' }}>
                    לא נמצאו קופונים.
                </Typography>
            )}
        </Container>
    );
}

export default GetCustomerCoupons;