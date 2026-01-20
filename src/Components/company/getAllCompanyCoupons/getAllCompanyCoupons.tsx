import "./getAllCompanyCoupons.css";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Coupon } from "../../../modal/Coupon";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import SingleCoupon from '../singleCoupon/singleCoupon';
import Slider from '@mui/material/Slider';
import { FormControl, InputLabel, Select, MenuItem, Grid, Typography, Paper, Container, Box } from "@mui/material";
import { CouponCategory } from "../../../modal/CouponCategory";
import LoadingSpinner from "../../common/LoadingSpinner/LoadingSpinner";
import { getHebrewCategory } from "../../../util/categories";
import { store } from "../../../redux/store";

function GetAllCompanyCoupons(): JSX.Element {
    const navigate = useNavigate();
    const location = useLocation();
    const [coupons, setCoupons] = useState<Coupon[]>([]);

    // Separate display price (instant) from logic price (committed)
    const [displayPrice, setDisplayPrice] = useState<number>(10000);
    const [maxPrice, setMaxPrice] = useState<number>(10000);

    const [category, setCategory] = useState<CouponCategory>(CouponCategory.ALL);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCoupons();
    }, [maxPrice, category]); 

    const getCoupons = async () => {
        setLoading(true);
        try {
            const userType = store.getState().authState.userType;
            const companyIdFromState = (location.state as any)?.companyId;

            // SCENARIO A: ADMIN VIEWING A SPECIFIC COMPANY'S COUPONS
            if (userType === "ADMIN" && companyIdFromState) {
                // Admin fetches the specific company object which contains the coupons list
                const res = await jwtAxios.get(globals.admin.getOneCompany + companyIdFromState);
                const companyCoupons: Coupon[] = res.data.coupons || [];
                
                // Since getOneCompany returns all coupons, we filter them client-side
                let filtered = companyCoupons;
                
                if (category !== CouponCategory.ALL) {
                    filtered = filtered.filter(c => c.category === category);
                }
                
                filtered = filtered.filter(c => c.price <= maxPrice);
                setCoupons(filtered);
            } 
            // SCENARIO B: COMPANY VIEWING ITS OWN COUPONS (Original Logic)
            else {
                let url = (category === CouponCategory.ALL)
                    ? globals.company.getAllCoupons
                    : `${globals.company.getCouponByCategory}/${category}`;

                const res = await jwtAxios.get<Coupon[]>(url);

                // Client-side filtering for price
                const filtered = res.data.filter(c => c.price <= maxPrice);
                setCoupons(filtered);
            }
        } catch (err) {
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
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }} dir="rtl">
            <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
                {store.getState().authState.userType === "ADMIN" ? "קופונים של החברה" : "הקופונים שלי"}
            </Typography>

            {/* Filtering Area */}
            <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                <Grid container spacing={4} justifyContent="center" alignItems="center">
                    <Grid item xs={12} md={4}>
                        <Typography variant="body2" gutterBottom>
                            מחיר מקסימלי: ₪{displayPrice}
                        </Typography>
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
                                {Object.values(CouponCategory).filter(c => c !== "ALL").map(c => (
                                    <MenuItem key={c} value={c}>{getHebrewCategory(c)}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {/* Content Area */}
            <Box sx={{ minHeight: '300px' }}>
                {loading ? (
                    <LoadingSpinner />
                ) : coupons.length === 0 ? (
                    <Typography variant="h6" align="center" color="textSecondary" sx={{ mt: 5 }}>
                        לא נמצאו קופונים התואמים את הסינון.
                    </Typography>
                ) : (
                    <Grid container spacing={3}>
                        {coupons.map(c => (
                            <Grid item key={c.id} xs={12} sm={6} md={4} lg={3}>
                                <SingleCoupon
                                    coupon={c}
                                    // Update is only allowed for the Company itself, usually logic inside SingleCoupon handles visibility
                                    updateCoupon={() => navigate("/company/updateCoupon", {state: {coupon: c}})}
                                    onDelete={(id) => setCoupons(coupons.filter(x => x.id !== id))}
                                    // If Admin is viewing, it's not "Owned" in the sense of My Coupons for purchase, but for management
                                    isOwned={true} 
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Container>
    );
}

export default GetAllCompanyCoupons;