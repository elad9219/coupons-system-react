
import "./updateCoupon.css";

import {
    FormEvent,
    useEffect,
    useRef,
    useState
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from "@mui/material";

import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import notify from "../../../util/notify";
import { getApiErrorMessage } from "../../../util/apiError";
import {
    MAX_COUPON_AMOUNT,
    validateCouponAmount,
    validateCouponForm
} from "../../../util/couponFormValidation";
import { Coupon } from "../../../modal/Coupon";
import { CouponCategory } from "../../../modal/CouponCategory";
import { getHebrewCategory } from "../../../util/categories";

interface CouponNavigationState {
    coupon?: Coupon;
}

function UpdateCoupon(): JSX.Element {
    const location = useLocation();
    const navigate = useNavigate();

    const [coupon, setCoupon] = useState<Coupon | null>(null);
    const [amountInput, setAmountInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const submittingRef = useRef(false);

    useEffect(() => {
        const navigationState =
            location.state as CouponNavigationState | null;

        const selectedCoupon = navigationState?.coupon;

        if (selectedCoupon) {
            setCoupon({ ...selectedCoupon });
            setAmountInput(String(selectedCoupon.amount));
        } else {
            notify.error("נתוני הקופון חסרים. חוזר לרשימה.");
            navigate("/company/allCoupons");
        }
    }, [location.state, navigate]);

    const amountError = coupon
        ? validateCouponAmount(
            amountInput.trim() === ""
                ? NaN
                : Number(amountInput),
            false
        )
        : null;

    const handleSave = async (
        event: FormEvent<HTMLFormElement>
    ): Promise<void> => {
        event.preventDefault();

        if (!coupon || submittingRef.current) {
            return;
        }

        const couponToSend: Coupon = {
            ...coupon,
            title: coupon.title.trim(),
            description: coupon.description?.trim(),
            image: coupon.image?.trim() || undefined,
            amount: amountInput.trim() === ""
                ? NaN
                : Number(amountInput),
            start_date: coupon.start_date.split("T")[0],
            end_date: coupon.end_date.split("T")[0]
        };

        const validationError = validateCouponForm(
            couponToSend,
            false
        );

        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        submittingRef.current = true;
        setIsSubmitting(true);
        setErrorMessage("");

        try {
            await jwtAxios.put(
                globals.company.updateCoupon,
                couponToSend
            );

            notify.success("הקופון עודכן בהצלחה");
            navigate("/company/allCoupons");
        } catch (error) {
            setErrorMessage(
                getApiErrorMessage(
                    error,
                    "לא הצלחנו לעדכן את הקופון. בדוק את הפרטים ונסה שוב."
                )
            );
        } finally {
            submittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    if (!coupon) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 5
                }}
            >
                <Typography>טוען נתונים...</Typography>
            </Box>
        );
    }

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
                    עדכון קופון: {coupon.title}
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

                <form onSubmit={handleSave}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FormControl fullWidth size="small">
                                <InputLabel>קטגוריה</InputLabel>
                                <Select
                                    value={coupon.category}
                                    label="קטגוריה"
                                    disabled={isSubmitting}
                                    onChange={event =>
                                        setCoupon({
                                            ...coupon,
                                            category: event.target.value
                                        })
                                    }
                                >
                                    {Object.values(CouponCategory)
                                        .filter(
                                            value =>
                                                value !== CouponCategory.ALL
                                        )
                                        .map(value => (
                                            <MenuItem
                                                key={value}
                                                value={value}
                                            >
                                                {getHebrewCategory(value)}
                                            </MenuItem>
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
                                disabled={isSubmitting}
                                inputProps={{ maxLength: 25 }}
                                onChange={event =>
                                    setCoupon({
                                        ...coupon,
                                        title: event.target.value
                                    })
                                }
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
                                value={coupon.description || ""}
                                disabled={isSubmitting}
                                inputProps={{ maxLength: 1024 }}
                                onChange={event =>
                                    setCoupon({
                                        ...coupon,
                                        description: event.target.value
                                    })
                                }
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="תאריך התחלה"
                                type="date"
                                fullWidth
                                size="small"
                                value={coupon.start_date.split("T")[0]}
                                disabled={isSubmitting}
                                onChange={event =>
                                    setCoupon({
                                        ...coupon,
                                        start_date: event.target.value
                                    })
                                }
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="תאריך סיום"
                                type="date"
                                fullWidth
                                size="small"
                                value={coupon.end_date.split("T")[0]}
                                disabled={isSubmitting}
                                onChange={event =>
                                    setCoupon({
                                        ...coupon,
                                        end_date: event.target.value
                                    })
                                }
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                type="number"
                                label="כמות"
                                fullWidth
                                size="small"
                                value={amountInput}
                                disabled={isSubmitting}
                                onChange={event => {
                                    setAmountInput(event.target.value);
                                }}
                                inputProps={{
                                    min: 0,
                                    max: MAX_COUPON_AMOUNT,
                                    step: 1
                                }}
                                error={Boolean(amountError)}
                                helperText={
                                    amountError ||
                                    "מקסימום 100,000 קופונים"
                                }
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                type="number"
                                label="מחיר"
                                fullWidth
                                size="small"
                                value={coupon.price}
                                disabled={isSubmitting}
                                onChange={event =>
                                    setCoupon({
                                        ...coupon,
                                        price: Number(event.target.value)
                                    })
                                }
                                inputProps={{
                                    min: 0.01,
                                    max: 9999,
                                    step: "any"
                                }}
                                required
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="קישור לתמונה (לא חובה)"
                                fullWidth
                                size="small"
                                value={coupon.image || ""}
                                disabled={isSubmitting}
                                inputProps={{ maxLength: 1024 }}
                                onChange={event =>
                                    setCoupon({
                                        ...coupon,
                                        image: event.target.value
                                    })
                                }
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
                                sx={{
                                    mt: 2,
                                    fontWeight: "bold"
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
                                        שומר שינויים...
                                    </Box>
                                ) : (
                                    "שמור שינויים"
                                )}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
}

export default UpdateCoupon;
