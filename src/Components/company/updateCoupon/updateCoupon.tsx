import "./updateCoupon.css";
import { Typography, TextField, Button, Container, Paper, Grid, Box, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import jwtAxios from '../../../util/JWTaxios';
import globals from "../../../util/global";
import notify from "../../../util/notify";
import { Coupon } from "../../../modal/Coupon";
import { useState, useEffect } from "react";
import { CouponCategory } from "../../../modal/CouponCategory";
import { getHebrewCategory } from "../../../util/categories";

function UpdateCoupon(): JSX.Element {
    const location = useLocation();
    const navigate = useNavigate();
    const [coupon, setCoupon] = useState<Coupon | null>(null);

    useEffect(() => {
        const couponFromState = (location.state as any)?.coupon;
        
        if (couponFromState) {
            setCoupon({ ...couponFromState });
        } else {
            notify.error("נתוני קופון חסרים, חוזר לרשימה");
            navigate("/company/allCoupons");
        }
    }, [location.state, navigate]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!coupon) return;

        // Ensure dates are string yyyy-MM-dd for Spring Boot
        const couponToSend = {
            ...coupon,
            start_date: typeof coupon.start_date === 'string' ? coupon.start_date.split('T')[0] : coupon.start_date,
            end_date: typeof coupon.end_date === 'string' ? coupon.end_date.split('T')[0] : coupon.end_date,
        };

        console.log("Sending update request:", couponToSend);

        jwtAxios.put(globals.company.updateCoupon, couponToSend)
            .then(() => {
                notify.success("הקופון עודכן בהצלחה");
                navigate("/company/allCoupons");
            })
            .catch(err => {
                console.error("Backend Error:", err.response?.data);
                const backendMsg = err.response?.data?.description || err.response?.data?.message || "שגיאה בעדכון הקופון";
                notify.error(backendMsg);
            });
    };

    if (!coupon) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><Typography>טוען נתונים...</Typography></Box>;

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }} dir="rtl">
                <Typography variant="h5" align="center" gutterBottom fontWeight="bold" color="primary">
                    עדכון קופון: {coupon.title}
                </Typography>
                
                <form onSubmit={handleSave}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FormControl fullWidth size="small">
                                <InputLabel>קטגוריה</InputLabel>
                                <Select
                                    value={coupon.category}
                                    label="קטגוריה"
                                    onChange={e => setCoupon({ ...coupon, category: e.target.value as any })}
                                >
                                    {Object.values(CouponCategory).filter(c => c !== "ALL").map(c => (
                                        <MenuItem key={c} value={c}>{getHebrewCategory(c)}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField 
                                label="כותרת" 
                                fullWidth 
                                size="small"
                                value={coupon.title} 
                                onChange={e => setCoupon({ ...coupon, title: e.target.value })} 
                                required
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <TextField 
                                label="תיאור" 
                                multiline 
                                rows={2} 
                                fullWidth 
                                size="small"
                                value={coupon.description} 
                                onChange={e => setCoupon({ ...coupon, description: e.target.value })} 
                                required
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                label="תאריך התחלה"
                                type="date"
                                fullWidth
                                size="small"
                                value={typeof coupon.start_date === 'string' ? coupon.start_date.split('T')[0] : ""}
                                onChange={e => setCoupon({ ...coupon, start_date: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                label="תאריך סיום"
                                type="date"
                                fullWidth
                                size="small"
                                value={typeof coupon.end_date === 'string' ? coupon.end_date.split('T')[0] : ""}
                                onChange={e => setCoupon({ ...coupon, end_date: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField 
                                type="number" 
                                label="כמות" 
                                fullWidth 
                                size="small"
                                value={coupon.amount} 
                                onChange={e => setCoupon({ ...coupon, amount: +e.target.value })} 
                                required
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField 
                                type="number" 
                                label="מחיר" 
                                fullWidth 
                                size="small"
                                value={coupon.price} 
                                onChange={e => setCoupon({ ...coupon, price: +e.target.value })} 
                                required
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField 
                                label="URL תמונה" 
                                fullWidth 
                                size="small"
                                value={coupon.image} 
                                onChange={e => setCoupon({ ...coupon, image: e.target.value })} 
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                color="primary"
                                fullWidth 
                                size="large" 
                                sx={{ mt: 2, fontWeight: 'bold' }}
                            >
                                שמור שינויים
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
}

export default UpdateCoupon;