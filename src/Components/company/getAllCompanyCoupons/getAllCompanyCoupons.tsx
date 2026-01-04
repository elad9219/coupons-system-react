import "./getAllCompanyCoupons.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Coupon } from "../../../modal/Coupon";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import SingleCoupon from '../singleCoupon/singleCoupon';
import Slider from '@mui/material/Slider';
import { FormControl, InputLabel, Select, MenuItem, Grid, Typography, Paper, Container, Box } from "@mui/material";
import { CouponCategory } from "../../../modal/CouponCategory";
import LoadingSpinner from "../../common/LoadingSpinner/LoadingSpinner";
import { getHebrewCategory } from "../../../util/categories";

function GetAllCompanyCoupons(): JSX.Element {
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    
    // הפרדה בין מחיר לתצוגה (מהיר) למחיר לוגיקה (בסיום גרירה)
    const [displayPrice, setDisplayPrice] = useState<number>(10000);
    const [maxPrice, setMaxPrice] = useState<number>(10000);
    
    const [category, setCategory] = useState<CouponCategory>(CouponCategory.ALL);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCoupons();
    }, [maxPrice, category]); // מגיב רק כשהמחיר הסופי משתנה או הקטגוריה

    const getCoupons = async () => {
        setLoading(true);
        try {
            // בחירת הכתובת הנכונה לפי הקטגוריה
            let url = (category === CouponCategory.ALL) 
                ? globals.company.getAllCoupons 
                : `${globals.company.getCouponByCategory}/${category}`;
            
            const res = await jwtAxios.get<Coupon[]>(url);
            
            // סינון קליאנט-סייד לפי המחיר שנבחר
            const filtered = res.data.filter(c => c.price <= maxPrice);
            setCoupons(filtered);
        } catch (err) {
            // אם אין קופונים או שיש שגיאה, נאפס את המערך
            setCoupons([]);
        } finally {
            // סיום טעינה בכל מקרה (הצלחה או כישלון) כדי להעלים את הספינר
            setLoading(false);
        }
    };

    // פונקציה לטיפול בגרירת הסליידר (רק ויזואלי)
    const handleSliderChange = (event: Event, newValue: number | number[]) => {
        setDisplayPrice(newValue as number);
    };

    // פונקציה לטיפול בסיום הגרירה (מפעיל את הלוגיקה)
    const handleSliderCommit = (event: Event | React.SyntheticEvent, newValue: number | number[]) => {
        setMaxPrice(newValue as number);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }} dir="rtl">
            <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
                הקופונים שלי
            </Typography>
            
            {/* אזור הסינון - נשאר קבוע תמיד */}
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
                            onChange={handleSliderChange} // עדכון בזמן אמת של המספר
                            onChangeCommitted={handleSliderCommit} // עדכון הסינון רק בעזיבת העכבר
                            valueLabelDisplay="auto"
                            sx={{direction: 'ltr'}} // כדי שהסליידר יעבוד משמאל לימין כמו שצריך
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

            {/* אזור התוכן - כאן מופיע הספינר או הקופונים */}
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
                                    updateCoupon={() => navigate("/company/updateCoupon", {state: {coupon: c}})} 
                                    onDelete={(id) => setCoupons(coupons.filter(x => x.id !== id))} 
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