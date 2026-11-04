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

import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";

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
        <Container
            maxWidth="sm"
            dir="rtl"
            sx={{
                mt: { xs: 2, md: 4 },
                mb: 6,
                px: { xs: 1, sm: 2 }
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2.5, sm: 4 },
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 16px 44px rgba(20,38,61,0.07)"
                }}
            >
                <Box
                    sx={{
                        textAlign: "center",
                        mb: 3.5
                    }}
                >
                    <Box
                        sx={{
                            mx: "auto",
                            mb: 2,
                            width: 64,
                            height: 64,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: 3,
                            bgcolor: "primary.light",
                            color: "primary.main"
                        }}
                    >
                        <LocalOfferRoundedIcon
                            sx={{ fontSize: 32 }}
                        />
                    </Box>

                    <Typography
                        component="h1"
                        variant="h5"
                        sx={{
                            fontWeight: 800,
                            color: "text.primary",
                            mb: 0.75
                        }}
                    >
                        יצירת קופון חדש
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.8 }}
                    >
                        הוסף הטבה חדשה עם פרטי הקופון, התוקף והמלאי הזמין.
                    </Typography>
                </Box>

                {errorMessage && (
                    <Alert
                        severity="error"
                        role="alert"
                        sx={{ mb: 3 }}
                    >
                        {errorMessage}
                    </Alert>
                )}

                <Box
                    component="form"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                >
                    <LocalizationProvider
                        dateAdapter={AdapterDateFns}
                        adapterLocale={heLocale}
                    >
                        <Grid container spacing={2.5}>
                            <Grid item xs={12}>
                                <InputLabel
                                    id="cat-label"
                                    sx={{
                                        mb: 1,
                                        fontSize: "0.875rem",
                                        fontWeight: 600,
                                        color: "text.secondary"
                                    }}
                                >
                                    קטגוריה
                                </InputLabel>

                                <Select
                                    labelId="cat-label"
                                    fullWidth
                                    value={selectedCategory}
                                    disabled={isSubmitting}
                                    onChange={event => {
                                        setSelectedCategory(
                                            event.target.value as string
                                        );
                                        setErrorMessage("");
                                    }}
                                    displayEmpty
                                    renderValue={value =>
                                        value ? (
                                            getHebrewCategory(value)
                                        ) : (
                                            <Box
                                                component="span"
                                                sx={{
                                                    color: "text.secondary"
                                                }}
                                            >
                                                בחר קטגוריה
                                            </Box>
                                        )
                                    }
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
                                    fullWidth
                                    disabled={isSubmitting}
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
                                    fullWidth
                                    multiline
                                    rows={3}
                                    disabled={isSubmitting}
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
                                            fullWidth
                                            InputLabelProps={{
                                                shrink: true
                                            }}
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
                                            fullWidth
                                            InputLabelProps={{
                                                shrink: true
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    type="number"
                                    label="כמות"
                                    fullWidth
                                    disabled={isSubmitting}
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
                                    fullWidth
                                    disabled={isSubmitting}
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
                                    fullWidth
                                    disabled={isSubmitting}
                                    inputProps={{
                                        maxLength: 1024,
                                        dir: "ltr",
                                        style: {
                                            textAlign: "right"
                                        }
                                    }}
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
                                    fullWidth
                                    size="large"
                                    disabled={isSubmitting}
                                    aria-busy={isSubmitting}
                                    sx={{
                                        mt: 1,
                                        minHeight: 50,
                                        borderRadius: 2.5,
                                        fontSize: "1rem"
                                    }}
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
                </Box>
            </Paper>
        </Container>
    );
}

export default AddCoupon;