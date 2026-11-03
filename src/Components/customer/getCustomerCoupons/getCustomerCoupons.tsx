import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
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

import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";

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
        <Container
            maxWidth="xl"
            dir="rtl"
            sx={{
                mt: { xs: 2, md: 3 },
                mb: 5,
                px: { xs: 1, sm: 2, md: 3 }
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 3
                }}
            >
                <Box
                    sx={{
                        display: "grid",
                        placeItems: "center",
                        width: 48,
                        height: 48,
                        flexShrink: 0,
                        borderRadius: 2.5,
                        bgcolor: "primary.light",
                        color: "primary.main"
                    }}
                >
                    <LocalOfferRoundedIcon />
                </Box>

                <Box>
                    <Typography
                        component="h1"
                        variant="h5"
                        sx={{
                            fontWeight: 800,
                            color: "text.primary"
                        }}
                    >
                        {userType === "ADMIN"
                            ? "קופונים של הלקוח"
                            : "הקופונים שלי"}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        כל ההטבות שנרכשו, במקום אחד.
                    </Typography>
                </Box>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, md: 2.5 },
                    mb: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 8px 26px rgba(20,38,61,0.04)"
                }}
            >
                <Grid
                    container
                    spacing={3}
                    alignItems="center"
                    justifyContent="flex-start"
                >
                    <Grid item xs={12} md={4}>
                        <Box sx={{ px: 1.5 }}>
                            <Typography
                                gutterBottom
                                variant="body2"
                                fontWeight={700}
                            >
                                מחיר מקסימלי: ₪{maxPrice}
                            </Typography>

                            <Slider
                                aria-label="מחיר מקסימלי"
                                value={maxPrice}
                                min={0}
                                max={10000}
                                step={50}
                                onChange={(_, value) => {
                                    setMaxPrice(value as number);
                                }}
                                valueLabelDisplay="auto"
                                sx={{
                                    direction: "ltr",
                                    height: 6
                                }}
                            />
                        </Box>
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
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 4, md: 6 },
                        textAlign: "center",
                        border: "1px dashed",
                        borderColor: "divider"
                    }}
                >
                    <SearchOffRoundedIcon
                        sx={{
                            fontSize: 48,
                            color: "#B3BFD1",
                            mb: 1
                        }}
                    />

                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 800, mb: 1 }}
                    >
                        לא נמצאו קופונים שנרכשו התואמים את הסינון.
                    </Typography>

                    <Typography color="text.secondary">
                        אפשר לשנות את הסינון או לחזור לקטלוג לרכישת הטבה חדשה.
                    </Typography>
                </Paper>
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