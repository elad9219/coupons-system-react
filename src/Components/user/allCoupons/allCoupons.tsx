import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Alert,
    Box,
    Button,
    Container,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Slider,
    Typography
} from "@mui/material";

import { Coupon } from "../../../modal/Coupon";
import { Customer } from "../../../modal/Customer";
import { CouponCategory } from "../../../modal/CouponCategory";
import { RootState } from "../../../redux/store";
import { downloadSingleCustomer } from "../../../redux/customerState";
import SingleCoupon from "../../company/singleCoupon/singleCoupon";
import LoadingSpinner from "../../common/LoadingSpinner/LoadingSpinner";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import { getHebrewCategory } from "../../../util/categories";

function AllCoupons(): JSX.Element {
    const dispatch = useDispatch();

    const userType = useSelector(
        (state: RootState) => state.authState.userType
    );

    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [maxPrice, setMaxPrice] = useState(10000);
    const [displayPrice, setDisplayPrice] = useState(10000);
    const [category, setCategory] = useState<CouponCategory>(
        CouponCategory.ALL
    );
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let active = true;

        const loadCoupons = async () => {
            setLoading(true);
            setErrorMessage("");

            try {
                if (userType === "CUSTOMER") {
                    const profileResponse =
                        await jwtAxios.get<Customer>(
                            globals.customer.getCustomerDetails
                        );

                    if (!active) return;

                    if (
                        !profileResponse.data ||
                        typeof profileResponse.data.id !== "number"
                    ) {
                        throw new Error("Invalid customer profile");
                    }

                    dispatch(
                        downloadSingleCustomer([
                            profileResponse.data
                        ])
                    );
                }

                const url =
                    category === CouponCategory.ALL
                        ? globals.guest.allSystemCoupons
                        : `${globals.guest.allCouponsByCategory}/${category}`;

                const response = await jwtAxios.get<Coupon[]>(url);

                if (!active) return;

                if (!Array.isArray(response.data)) {
                    throw new Error("Invalid coupons response");
                }

                setCoupons(response.data);
            } catch {
                if (!active) return;

                setCoupons([]);
                setErrorMessage(
                    "לא הצלחנו לטעון את הקופונים כרגע. בדוק את החיבור ונסה שוב."
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadCoupons();

        return () => {
            active = false;
        };
    }, [category, userType, retryCount, dispatch]);

    const filteredCoupons = useMemo(
        () => coupons.filter(coupon => coupon.price <= maxPrice),
        [coupons, maxPrice]
    );

    const handleSliderChange = (
        _event: Event,
        newValue: number | number[]
    ) => {
        setDisplayPrice(newValue as number);
    };

    const handleSliderCommit = (
        _event: Event | React.SyntheticEvent,
        newValue: number | number[]
    ) => {
        setMaxPrice(newValue as number);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }} dir="rtl">
            <Typography
                variant="h4"
                gutterBottom
                align="center"
                fontWeight="bold"
                color="primary"
            >
                כל הקופונים במערכת
            </Typography>

            <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                <Grid
                    container
                    spacing={6}
                    alignItems="center"
                    justifyContent="center"
                >
                    <Grid item xs={12} md={5}>
                        <Typography
                            gutterBottom
                            variant="body1"
                            fontWeight="500"
                        >
                            סינון לפי מחיר:{" "}
                            <Box component="span" color="primary.main">
                                ₪{displayPrice}
                            </Box>
                        </Typography>

                        <Box sx={{ px: 2, pt: 1 }}>
                            <Slider
                                value={displayPrice}
                                min={0}
                                max={10000}
                                step={100}
                                onChange={handleSliderChange}
                                onChangeCommitted={handleSliderCommit}
                                valueLabelDisplay="auto"
                                sx={{ direction: "ltr", height: 8 }}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="medium">
                            <InputLabel>קטגוריה</InputLabel>
                            <Select
                                value={category}
                                label="קטגוריה"
                                onChange={event => {
                                    setCategory(
                                        event.target.value as CouponCategory
                                    );
                                }}
                            >
                                <MenuItem value={CouponCategory.ALL}>
                                    הכל
                                </MenuItem>

                                {Object.values(CouponCategory)
                                    .filter(item => item !== "ALL")
                                    .map(item => (
                                        <MenuItem
                                            key={item}
                                            value={item}
                                        >
                                            {getHebrewCategory(item)}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {loading ? (
                <LoadingSpinner />
            ) : errorMessage ? (
                <Box sx={{ maxWidth: 600, mx: "auto" }}>
                    <Alert
                        severity="error"
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                onClick={() => {
                                    setRetryCount(count => count + 1);
                                }}
                            >
                                נסה שוב
                            </Button>
                        }
                    >
                        {errorMessage}
                    </Alert>
                </Box>
            ) : filteredCoupons.length === 0 ? (
                <Typography
                    align="center"
                    color="text.secondary"
                    sx={{ mt: 4 }}
                >
                    לא נמצאו קופונים התואמים את הסינון.
                </Typography>
            ) : (
                <Grid container spacing={3}>
                    {filteredCoupons.map(coupon => (
                        <Grid
                            item
                            key={coupon.id}
                            xs={12}
                            sm={6}
                            md={4}
                            lg={3}
                        >
                            <SingleCoupon coupon={coupon} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}

export default AllCoupons;