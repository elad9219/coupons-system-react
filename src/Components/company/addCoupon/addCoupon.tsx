import "./addCoupon.css";
import { useNavigate } from "react-router-dom";
import { Button, InputLabel, MenuItem, Select, TextField, Typography, Container, Paper, Grid } from "@mui/material";
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import AdapterDateFns from '@date-io/date-fns';
import heLocale from 'date-fns/locale/he';
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import jwtAxios from '../../../util/JWTaxios';
import globals from '../../../util/global';
import notify from '../../../util/notify';
import { store } from "../../../redux/store";
import { Coupon } from '../../../modal/Coupon';
import advNotify from "../../../util/notify_advanced";
import { CouponCategory } from "../../../modal/CouponCategory";
import { format, addDays, isAfter } from 'date-fns';
import { getHebrewCategory } from "../../../util/categories";

function AddCoupon(): JSX.Element {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm<Coupon>();
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    useEffect(() => {
        if (store.getState().authState.userType !== "COMPANY") {
            advNotify.error("יש להתחבר כחברה");
            navigate("/login");
        }
    }, [navigate]);

    const onSubmit = (data: Coupon) => {
        jwtAxios.post(globals.company.addCoupon, data)
            .then(() => {
                notify.success("קופון נוסף בהצלחה");
                navigate("/company/allCoupons"); 
            })
            .catch(() => notify.error("שגיאה בהוספה"));
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h5" align="center" gutterBottom fontWeight="bold" color="primary">
                    יצירת קופון חדש
                </Typography>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={heLocale}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <InputLabel id="cat-label" sx={{mb:1}}>קטגוריה</InputLabel>
                                <Select
                                    labelId="cat-label"
                                    fullWidth
                                    size="small"
                                    value={selectedCategory}
                                    onChange={(e) => {
                                        const value = e.target.value as string;
                                        setSelectedCategory(value);
                                        setValue("category", value, { shouldValidate: true });
                                    }}
                                    displayEmpty
                                >
                                    <MenuItem value="" disabled>בחר קטגוריה</MenuItem>
                                    {Object.values(CouponCategory).filter(c => c !== "ALL").map(c => (
                                        <MenuItem key={c} value={c}>{getHebrewCategory(c)}</MenuItem>
                                    ))}
                                </Select>
                                {errors.category && <Typography color="error" variant="caption">חובה לבחור</Typography>}
                            </Grid>

                            <Grid item xs={12}>
                                <TextField label="כותרת" size="small" fullWidth {...register("title", { required: "חובה" })} InputLabelProps={{ shrink: true }} />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField label="תיאור" size="small" multiline rows={3} fullWidth {...register("description")} InputLabelProps={{ shrink: true }} />
                            </Grid>

                            <Grid item xs={6}>
                                <DatePicker
                                    label="תאריך התחלה"
                                    disablePast
                                    value={startDate}
                                    onChange={(newValue) => {
                                        setStartDate(newValue);
                                        if (newValue) setValue("start_date", format(newValue, 'yyyy-MM-dd'));
                                    }}
                                    renderInput={(params) => <TextField {...params} size="small" fullWidth InputLabelProps={{ shrink: true }} />}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <DatePicker
                                    label="תאריך סיום"
                                    disablePast
                                    value={endDate}
                                    minDate={startDate ? addDays(startDate, 1) : undefined}
                                    onChange={(newValue) => {
                                        setEndDate(newValue);
                                        if (newValue) setValue("end_date", format(newValue, 'yyyy-MM-dd'));
                                    }}
                                    shouldDisableDate={(date) => startDate ? !isAfter(date, startDate) : false}
                                    renderInput={(params) => <TextField {...params} size="small" fullWidth InputLabelProps={{ shrink: true }} />}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField type="number" label="כמות" size="small" fullWidth {...register("amount", { required: true, min: 1 })} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField type="number" label="מחיר (₪)" size="small" fullWidth {...register("price", { required: true, min: 1 })} InputLabelProps={{ shrink: true }} />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField label="קישור לתמונה" size="small" fullWidth {...register("image", { required: true })} InputLabelProps={{ shrink: true }} />
                            </Grid>

                            <Grid item xs={12}>
                                <Button type="submit" variant="contained" color="primary" fullWidth size="large" sx={{ mt: 2 }}>
                                    שמור ופרסם
                                </Button>
                            </Grid>
                        </Grid>
                    </LocalizationProvider>
                </form>
            </Paper>
        </Container>
    );
}

export default AddCoupon;