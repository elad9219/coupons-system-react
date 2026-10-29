import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    Alert,
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
import globals from "../../../util/global";
import jwtAxios from "../../../util/JWTaxios";
import { getHebrewCategory } from "../../../util/categories";
import SingleCoupon from "../../company/singleCoupon/singleCoupon";
import LoadingSpinner from "../../common/LoadingSpinner/LoadingSpinner";

interface CustomerNavigationState {
    customerId?: number | string;
}

function GetCustomerCoupons(): JSX.Element {
    const location = useLocation();

    const userType = useSelector(
        (state: RootState) => state.authState.userType
    );

    const navigationState =
        location.state as CustomerNavigationState | null;

    const customerId = Number(navigationState?.customerId || 0);

    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [maxPrice, setMaxPrice] = useState(10000);
    const [category, setCategory] = useState<CouponCategory>(
        CouponCategory.ALL
    );
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let active = true;

        const loadPurchasedCoupons = async () => {
            setLoading(true);
            setErrorMessage("");

            try {
                let url: string;

                if (userType === "CUSTOMER") {
                    url = globals.customer.getCustomerDetails;
                } else if (
                    userType === "ADMIN" &&
                    Number.isInteger(customerId) &&
                    customerId > 0
                ) {
                    url =
                        globals.admin.getOneCustomer + customerId;
                } else {
                    throw new Error("Customer access is unavailable");
                }

                const response = await jwtAxios.get<Customer>(url);

                if (!active) return;

                if (
                    !response.data ||
                    (
                        response.data.coupons != null &&
                        !Array.isArray(response.data.coupons)
                    )
                ) {
                    throw new Error("Invalid customer response");
                }

                setCoupons(response.data.coupons || []);
            } catch {
                if (!active) return;

                setCoupons([]);
                setErrorMessage(
                    "לא ניתן לטעון את הקופונים שנרכשו. נסה שוב."
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadPurchasedCoupons();

        return () => {
            active = false;
        };
    }, [userType, customerId, retryCount]);

    const filteredCoupons = useMemo(
        () => coupons.filter(
            coupon =>
                coupon.price <= maxPrice &&
                (
                    category === CouponCategory.ALL ||
                    coupon.category === category
                )
        ),
        [coupons, maxPrice, category]
    );

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }} dir="rtl">
            <Typography
                variant="h4"
                align="center"
                gutterBottom
                fontWeight="bold"
                color="primary"
            >
                {userType === "ADMIN"
                    ? "קופונים של הלקוח"
                    : "הקופונים שלי"}
            </Typography>

            <Paper
                elevation={2}
                sx={{ p: 3, mb: 4, borderRadius: 3 }}
            >
                <Grid
                    container
                    spacing={4}
                    alignItems="center"
                    justifyContent="center"
                >
                    <Grid item xs={12} md={4}>
                        <Typography gutterBottom variant="body2">
                            מחיר מקסימלי: ₪{maxPrice}
                        </Typography>

                        <Slider
                            value={maxPrice}
                            min={0}
                            max={10000}
                            step={50}
                            onChange={(_, value) => {
                                setMaxPrice(value as number);
                            }}
                            valueLabelDisplay="auto"
                            sx={{ direction: "ltr" }}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
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
                                {Object.values(CouponCategory).map(item => (
                                    <MenuItem
                                        key={item}
                                        value={item}
                                    >
                                        {item === CouponCategory.ALL
                                            ? "הכל"
                                            : getHebrewCategory(item)}
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
            ) : filteredCoupons.length === 0 ? (
                <Typography
                    align="center"
                    color="text.secondary"
                    sx={{ mt: 4 }}
                >
                    לא נמצאו קופונים שנרכשו התואמים את הסינון.
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
                            <SingleCoupon
                                coupon={coupon}
                                isOwned
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}

export default GetCustomerCoupons;