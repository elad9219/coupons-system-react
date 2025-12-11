import "./allCoupons.css";
import { useEffect, useState } from "react";
import { Coupon } from "../../../modal/Coupon";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import SingleCoupon from "../../company/singleCoupon/singleCoupon";
import { FormControl, InputLabel, MenuItem, Select, Slider, Grid, Typography, Paper, Container, Box } from "@mui/material";
import { CouponCategory } from "../../../modal/CouponCategory";
import { getHebrewCategory } from "../../../util/categories";
import LoadingSpinner from "../../common/LoadingSpinner/LoadingSpinner";
import { store } from "../../../redux/store";

function AllCoupons(): JSX.Element {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [maxPrice, setMaxPrice] = useState<number>(10000);
    const [displayPrice, setDisplayPrice] = useState<number>(10000);
    const [category, setCategory] = useState<CouponCategory>(CouponCategory.ALL);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Force fetch customer details if logged in as customer to know what is purchased
        if (store.getState().authState.userType === "CUSTOMER") {
             jwtAxios.get(globals.customer.getAllCoupons)
                .then(res => store.dispatch({ type: "DOWNLOAD_CUSTOMERS", payload: [{ coupons: res.data }] }))
                .catch(() => {});
        }
        fetchCoupons();
    }, [maxPrice, category]);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            let url = globals.guest.allSystemCoupons;
            if (category !== CouponCategory.ALL) {
                url = `${globals.guest.allCouponsByCategory}/${category}`;
            }
            const response = await jwtAxios.get<Coupon[]>(url);
            const filtered = response.data.filter(c => c.price <= maxPrice);
            setCoupons(filtered);
        } catch (error) {
            setCoupons([]); 
        } finally {
            setLoading(false);
        }
    };

    const handleSliderChange = (event: Event, newValue: number | number[]) => {
        setDisplayPrice(newValue as number);
    };

    const handleSliderCommit = (event: Event | React.SyntheticEvent, newValue: number | number[]) => {
        setMaxPrice(newValue as number);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom align="center" fontWeight="bold" color="primary">
                כל הקופונים במערכת
            </Typography>
            
            {/* Filters - Always Visible */}
            <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                <Grid container spacing={4} alignItems="center" justifyContent="center">
                    <Grid item xs={12} md={4}>
                        <Typography gutterBottom variant="body2">סינון לפי מחיר: ₪{displayPrice}</Typography>
                        <Slider
                            value={displayPrice}
                            min={0}
                            max={10000}
                            step={50}
                            onChange={handleSliderChange}
                            onChangeCommitted={handleSliderCommit}
                            valueLabelDisplay="auto"
                            sx={{direction: 'ltr'}} 
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
                                <MenuItem value={CouponCategory.ALL}>הכל</MenuItem>
                                {Object.values(CouponCategory).filter(c => c !== "ALL").map(cat => (
                                    <MenuItem key={cat} value={cat} dir="rtl">
                                        {getHebrewCategory(cat)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {/* Content Area */}
            {loading ? (
                <LoadingSpinner />
            ) : (
                <Grid container spacing={3}>
                    {coupons.map(item => (
                        <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
                            <SingleCoupon 
                                coupon={item} 
                                updateCoupon={() => {}} 
                                isOwned={false}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
            
            {!loading && coupons.length === 0 && (
                <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
                    לא נמצאו קופונים התואמים את הסינון.
                </Typography>
            )}
        </Container>
    );
}

export default AllCoupons;