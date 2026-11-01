
import "./addCoupon.css";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from "@mui/material";
import {
    DatePicker,
    LocalizationProvider
} from "@mui/x-date-pickers";
import AdapterDateFns from "@date-io/date-fns";
import heLocale from "date-fns/locale/he";
import { format, isValid } from "date-fns";

import { Coupon } from "../../../modal/Coupon";
import { CouponCategory } from "../../../modal/CouponCategory";
import { store } from "../../../redux/store";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import notify from "../../../util/notify";
import advNotify from "../../../util/notify_advanced";
import { getApiErrorMessage } from "../../../util/apiError";
import {
    MAX_COUPON_AMOUNT,
    validateCouponAmount,
    validateCouponForm
} from "../../../util/couponFormValidation";
import { getHebrewCategory } from "../../../util/categories";

function AddCoupon(): JSX.Element {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<Coupon>({
        mode: "onChange"
    });

    const navigate = useNavigate();
    const submittingRef = useRef(false);

    const [selectedCategory, setSelectedCategory] = useState("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (store.getState().authState.userType !== "COMPANY") {
            advNotify.error("יש להתחבר כחברה");
            navigate("/login");
        }
    }, [navigate]);

    const onSubmit = async (data: Coupon): Promise<void> => {
        if (submittingRef.current) {
            return;
        }

        const coupon: Partial<Coupon> = {
            category: selectedCategory,
            title: data.title?.trim(),
            description: data.description?.trim(),
            start_date:
                startDate && isValid(startDate)
                    ? format(startDate, "yyyy-MM-dd")
                    : "",
            end_date:
                endDate && isValid(endDate)
                    ? format(endDate, "yyyy-MM-dd")
                    : "",
            amount: data.amount,
            price: data.price,
            image: data.image?.trim() || undefined
        };

        const validationError = validateCouponForm(
            coupon,
            true
        );

        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        submittingRef.current = true;
        setIsSubmitting(true);
        setErrorMessage("");

        try {
            await jwtAxios.post(
                globals.company.addCoupon,
                coupon
            );

            notify.success("קופון נוסף בהצלחה");
            navigate("/company/allCoupons");
        } catch (error) {
            setErrorMessage(
                getApiErrorMessage(
                    error,
                    "לא הצלחנו ליצור את הקופון. בדוק את הפרטים ונסה שוב."
                )
            );
        } finally {
            submittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Paper
                elevation={3}
                sx={{ p: 4, borderRadius: 2 }}
                dir="rtl"
            >
                <Typography
                    variant="h5"
                    align="center"
                    gutterBottom
                    fontWeight="bold"
                    color="primary"
                >
                    יצירת קופון חדש
                </Typography>

                {errorMessage && (
                    <Alert
                        severity="error"
                        role="alert"
                        sx={{ mb: 3 }}
                    >
                        {errorMessage}
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <LocalizationProvider
                        dateAdapter={AdapterDateFns}
                        adapterLocale={heLocale}
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <InputLabel
                                    id="cat-label"
                                    sx={{ mb: 1 }}
                                >
                                    קטגוריה
                                </InputLabel>

                                <Select
                                    labelId="cat-label"
                                    fullWidth
                                    size="small"
                                    value={selectedCategory}
                                    disabled={isSubmitting}
                                    onChange={event => {
                                        setSelectedCategory(
                                            event.target.value as string
                                        );
                                        setErrorMessage("");
                                    }}
                                    displayEmpty
                                >
                                    <MenuItem value="" disabled>
                                        בחר קטגוריה
                                    </MenuItem>

                                    {Object.values(CouponCategory)
                                        .filter(category =>
                                            category !== CouponCategory.ALL
                                        )
                                        .map(category => (
                                            <MenuItem
                                                key={category}
                                                value={category}
                                            >
                                                {getHebrewCategory(category)}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="כותרת"
                                    size="small"
                                    fullWidth
                                    disabled={isSubmitting}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ maxLength: 25 }}
                                    error={Boolean(errors.title)}
                                    helperText={errors.title?.message}
                                    {...register("title", {
                                        required: "יש להזין כותרת.",
                                        maxLength: {
                                            value: 25,
                                            message: "עד 25 תווים."
                                        },
                                        validate: value =>
                                            Boolean(value?.trim()) ||
                                            "יש להזין כותרת."
                                    })}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="תיאור"
                                    size="small"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    disabled={isSubmitting}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ maxLength: 1024 }}
                                    error={Boolean(errors.description)}
                                    helperText={errors.description?.message}
                                    {...register("description", {
                                        required: "יש להזין תיאור.",
                                        maxLength: {
                                            value: 1024,
                                            message: "עד 1024 תווים."
                                        },
                                        validate: value =>
                                            Boolean(value?.trim()) ||
                                            "יש להזין תיאור."
                                    })}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <DatePicker
                                    label="תאריך התחלה"
                                    disablePast
                                    disabled={isSubmitting}
                                    value={startDate}
                                    onChange={value => {
                                        setStartDate(value);
                                        setErrorMessage("");
                                    }}
                                    renderInput={params => (
                                        <TextField
                                            {...params}
                                            size="small"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <DatePicker
                                    label="תאריך סיום"
                                    disablePast
                                    disabled={isSubmitting}
                                    minDate={startDate || undefined}
                                    value={endDate}
                                    onChange={value => {
                                        setEndDate(value);
                                        setErrorMessage("");
                                    }}
                                    renderInput={params => (
                                        <TextField
                                            {...params}
                                            size="small"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    type="number"
                                    label="כמות"
                                    size="small"
                                    fullWidth
                                    disabled={isSubmitting}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{
                                        min: 1,
                                        max: MAX_COUPON_AMOUNT,
                                        step: 1
                                    }}
                                    error={Boolean(errors.amount)}
                                    helperText={
                                        errors.amount?.message ||
                                        "מקסימום 100,000 קופונים"
                                    }
                                    {...register("amount", {
                                        required: "יש להזין כמות.",
                                        valueAsNumber: true,
                                        validate: value =>
                                            validateCouponAmount(
                                                value,
                                                true
                                            ) || true
                                    })}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    type="number"
                                    label="מחיר (₪)"
                                    size="small"
                                    fullWidth
                                    disabled={isSubmitting}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{
                                        min: 0.01,
                                        max: 9999,
                                        step: "any"
                                    }}
                                    error={Boolean(errors.price)}
                                    helperText={errors.price?.message}
                                    {...register("price", {
                                        required: "יש להזין מחיר.",
                                        valueAsNumber: true,
                                        min: {
                                            value: 0.01,
                                            message: "יש להזין מחיר חיובי."
                                        },
                                        max: {
                                            value: 9999,
                                            message: "מחיר מקסימלי: 9999 ₪."
                                        }
                                    })}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="קישור לתמונה (לא חובה)"
                                    size="small"
                                    fullWidth
                                    disabled={isSubmitting}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ maxLength: 1024 }}
                                    error={Boolean(errors.image)}
                                    helperText={errors.image?.message}
                                    {...register("image", {
                                        maxLength: {
                                            value: 1024,
                                            message: "הקישור ארוך מדי."
                                        }
                                    })}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    size="large"
                                    disabled={isSubmitting}
                                    aria-busy={isSubmitting}
                                    sx={{ mt: 2 }}
                                >
                                    {isSubmitting ? (
                                        <Box
                                            component="span"
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1
                                            }}
                                        >
                                            <CircularProgress
                                                size={20}
                                                color="inherit"
                                            />
                                            שומר קופון...
                                        </Box>
                                    ) : (
                                        "שמור ופרסם"
                                    )}
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
