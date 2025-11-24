import "./updateCoupon.css";
import { Typography, TextField, Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { store } from "../../../redux/store";
import jwtAxios from '../../../util/JWTaxios';
import globals from "../../../util/global";
import notify from "../../../util/notify";
import { Coupon } from "../../../modal/Coupon";
import { updateCoupon } from "../../../redux/couponState";
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import AdapterDateFns from '@date-io/date-fns';
import heLocale from 'date-fns/locale/he';
import { format, addDays, isAfter, parse } from 'date-fns';
import { useEffect, useState } from "react";

function UpdateCoupon(): JSX.Element {
    const location = useLocation();
    const navigate = useNavigate();
    const couponId = (location.state as any)?.couponId;
    const [coupon, setCoupon] = useState<Coupon | null>(null);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    useEffect(() => {
        // First try Redux
        let found = store.getState().couponState.coupon.find(c => c.id === couponId);
        if (found) {
            setCoupon(found);
            setStartDate(parse(found.start_date, 'yyyy-MM-dd', new Date()));
            setEndDate(parse(found.end_date, 'yyyy-MM-dd', new Date()));
        } else {
            // If not in Redux – load from server
            jwtAxios.get<Coupon>(`${globals.company.getOneCompanyCoupon}/${couponId}`)
                .then(res => {
                    setCoupon(res.data);
                    setStartDate(parse(res.data.start_date, 'yyyy-MM-dd', new Date()));
                    setEndDate(parse(res.data.end_date, 'yyyy-MM-dd', new Date()));
                })
                .catch(() => notify.error("שגיאה בטעינת קופון"));
        }
    }, [couponId]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!coupon) return;
        jwtAxios.put(globals.company.updateCoupon, coupon)
            .then(() => {
                notify.success("עודכן בהצלחה");
                store.dispatch(updateCoupon(coupon));
                navigate("/company/allCoupons");
            })
            .catch(() => notify.error("שגיאה"));
    };

    if (!coupon) return <div>טוען...</div>;

    return (
        <div className="updateCoupon SolidBox">
            <Typography variant="h4">עדכון קופון</Typography><hr/>
            <form onSubmit={handleSave} style={{padding: 20}}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={heLocale}>
                    <TextField label="כותרת" fullWidth value={coupon.title} onChange={e => setCoupon({...coupon, title: e.target.value})} />
                    <br/><br/>

                    <TextField label="תיאור" multiline rows={4} fullWidth value={coupon.description || ""} onChange={e => setCoupon({...coupon, description: e.target.value})} />
                    <br/><br/>

                    <DatePicker
                        label="תאריך התחלה"
                        value={startDate}
                        onChange={(newValue) => {
                            setStartDate(newValue);
                            if (newValue) setCoupon({...coupon, start_date: format(newValue, 'yyyy-MM-dd')});
                        }}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                    <br/><br/>

                    <DatePicker
                        label="תאריך סיום"
                        value={endDate}
                        minDate={startDate ? addDays(startDate, 1) : undefined}
                        onChange={(newValue) => {
                            setEndDate(newValue);
                            if (newValue) setCoupon({...coupon, end_date: format(newValue, 'yyyy-MM-dd')});
                        }}
                        shouldDisableDate={(d) => d ? !isAfter(d, startDate || new Date()) : false}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                    <br/><br/>

                    <TextField type="number" label="כמות" fullWidth value={coupon.amount} onChange={e => setCoupon({...coupon, amount: +e.target.value})} />
                    <br/><br/>

                    <TextField type="number" label="מחיר" fullWidth value={coupon.price} onChange={e => setCoupon({...coupon, price: +e.target.value})} />
                    <br/><br/>

                    <TextField label="תמונה" fullWidth value={coupon.image || ""} onChange={e => setCoupon({...coupon, image: e.target.value})} />
                    <br/><br/>

                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        שמור שינויים
                    </Button>
                </LocalizationProvider>
            </form>
        </div>
    );
}

export default UpdateCoupon;