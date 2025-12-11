import "./updateCoupon.css";
import { Typography, TextField, Button, Container, Paper, Grid } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import jwtAxios from '../../../util/JWTaxios';
import globals from "../../../util/global";
import notify from "../../../util/notify";
import { Coupon } from "../../../modal/Coupon";
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import AdapterDateFns from '@date-io/date-fns';
import heLocale from 'date-fns/locale/he';
import { format } from 'date-fns';
import { useEffect, useState } from "react";
import LoadingSpinner from "../../common/LoadingSpinner/LoadingSpinner";

function UpdateCoupon(): JSX.Element {
    const location = useLocation();
    const navigate = useNavigate();
    const stateCouponId = (location.state as any)?.couponId;
    const [coupon, setCoupon] = useState<Coupon | null>(null);

    useEffect(() => {
        if (!stateCouponId) { navigate("/company/allCoupons"); return; }
        
        jwtAxios.get<Coupon>(`${globals.company.getOneCompanyCoupon}${stateCouponId}`)
            .then(res => setCoupon(res.data))
            .catch(() => navigate("/company/allCoupons"));
    }, [stateCouponId, navigate]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!coupon) return;
        jwtAxios.put(globals.company.updateCoupon, coupon)
            .then(() => {
                notify.success("עודכן בהצלחה");
                navigate("/company/allCoupons");
            })
            .catch(() => notify.error("שגיאה בעדכון"));
    };

    if (!coupon) return <LoadingSpinner />;

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }} dir="rtl">
                <Typography variant="h5" align="center" gutterBottom fontWeight="bold" color="primary">עדכון קופון</Typography>
                <form onSubmit={handleSave}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={heLocale}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField label="כותרת" fullWidth size="small" value={coupon.title} onChange={e => setCoupon({...coupon, title: e.target.value})} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField label="תיאור" multiline rows={2} fullWidth size="small" value={coupon.description} onChange={e => setCoupon({...coupon, description: e.target.value})} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={6}>
                                <DatePicker
                                    label="תאריך התחלה"
                                    value={new Date(coupon.start_date)}
                                    onChange={(v) => v && setCoupon({...coupon, start_date: format(v, 'yyyy-MM-dd')})}
                                    renderInput={(p) => <TextField {...p} size="small" fullWidth InputLabelProps={{ shrink: true }} sx={{ textAlign: 'right' }}/>}
                                    disableMaskedInput
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <DatePicker
                                    label="תאריך סיום"
                                    value={new Date(coupon.end_date)}
                                    onChange={(v) => v && setCoupon({...coupon, end_date: format(v, 'yyyy-MM-dd')})}
                                    renderInput={(p) => <TextField {...p} size="small" fullWidth InputLabelProps={{ shrink: true }} sx={{ textAlign: 'right' }}/>}
                                    disableMaskedInput
                                />
                            </Grid>
                            <Grid item xs={12}><Button type="submit" variant="contained" fullWidth>שמור</Button></Grid>
                        </Grid>
                    </LocalizationProvider>
                </form>
            </Paper>
        </Container>
    );
}

export default UpdateCoupon;