import "./addCoupon.css";
import { useNavigate } from "react-router-dom";
import { Button, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
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
import { addCoupon } from "../../../redux/couponState";
import advNotify from "../../../util/notify_advanced";
import { CouponCategory } from "../../../modal/CouponCategory";
import { format, addDays, isAfter } from 'date-fns';

function AddCoupon(): JSX.Element {
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Coupon>();
    const navigate = useNavigate();

    // מצב לקטגוריה – כדי שה-Select יראה את הבחירה
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
                store.dispatch(addCoupon(data));
                navigate("/");
            })
            .catch(() => notify.error("שגיאה בהוספה"));
    };

    return (
        <div className="addCoupon">
            <Typography variant="h4">הוספת קופון</Typography><hr/>
            <div className="SolidBox" style={{padding: 20}}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={heLocale}>
                        {/* קטגוריה – עובד ויזואלית + שומר ב-form */}
                        <InputLabel>קטגוריה</InputLabel>
                        <Select
                            fullWidth
                            value={selectedCategory}
                            onChange={(e) => {
                                const value = e.target.value as string;
                                setSelectedCategory(value);
                                setValue("category", value, { shouldValidate: true });
                            }}
                            displayEmpty
                            renderValue={(selected) => selected ? selected : "בחר קטגוריה"}
                        >
                            {Object.values(CouponCategory)
                                .filter(c => c !== "ALL")
                                .map(c => (
                                    <MenuItem key={c} value={c}>{c}</MenuItem>
                                ))}
                        </Select>
                        {errors.category && <span style={{color: "red"}}>{errors.category.message}</span>}
                        <br/><br/>

                        <TextField label="כותרת" fullWidth {...register("title", {required: "חובה"})} />
                        <br/><br/>

                        <TextField label="תיאור" multiline rows={4} fullWidth {...register("description")} />
                        <br/><br/>

                        <DatePicker
                            label="תאריך התחלה"
                            disablePast
                            value={startDate}
                            onChange={(newValue) => {
                                setStartDate(newValue);
                                if (newValue) {
                                    setValue("start_date", format(newValue, 'yyyy-MM-dd'));
                                }
                            }}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                        <br/><br/>

                        <DatePicker
                            label="תאריך סיום"
                            disablePast
                            value={endDate}
                            minDate={startDate ? addDays(startDate, 1) : undefined}
                            onChange={(newValue) => {
                                setEndDate(newValue);
                                if (newValue) {
                                    setValue("end_date", format(newValue, 'yyyy-MM-dd'));
                                }
                            }}
                            shouldDisableDate={(date) => startDate ? !isAfter(date, startDate) : false}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                        <br/><br/>

                        <TextField type="number" label="כמות" fullWidth {...register("amount", {required: true, min: 1})} />
                        <br/><br/>

                        <TextField type="number" label="מחיר" fullWidth {...register("price", {required: true, min: 1})} />
                        <br/><br/>

                        <TextField label="קישור לתמונה" fullWidth {...register("image", {required: true})} />
                        <br/><br/>

                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            הוסף קופון
                        </Button>
                    </LocalizationProvider>
                </form>
            </div>
        </div>
    );
}

export default AddCoupon;