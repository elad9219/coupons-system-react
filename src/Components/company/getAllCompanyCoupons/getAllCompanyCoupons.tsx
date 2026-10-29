import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

import { Company } from "../../../modal/Company";
import { Coupon } from "../../../modal/Coupon";
import { CouponCategory } from "../../../modal/CouponCategory";
import { RootState } from "../../../redux/store";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import SingleCoupon from "../singleCoupon/singleCoupon";
import LoadingSpinner from "../../common/LoadingSpinner/LoadingSpinner";
import { getHebrewCategory } from "../../../util/categories";

interface CompanyNavigationState {
    companyId?: number | string;
}

function GetAllCompanyCoupons(): JSX.Element {
    const navigate = useNavigate();
    const location = useLocation();

    const userType = useSelector(
        (state: RootState) => state.authState.userType
    );

    const navigationState =
        location.state as CompanyNavigationState | null;

    const companyId = Number(navigationState?.companyId || 0);

    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [displayPrice, setDisplayPrice] = useState(10000);
    const [maxPrice, setMaxPrice] = useState(10000);
    const [category, setCategory] = useState<CouponCategory>(
        CouponCategory.ALL
    );
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let active = true;

        const loadCompanyCoupons = async () => {
            setLoading(true);
            setErrorMessage("");

            try {
                let url: string;

                if (userType === "COMPANY") {
                    url = globals.company.getCompanyDetails;
                } else if (
                    userType === "ADMIN" &&
                    Number.isInteger(companyId) &&
                    companyId > 0
                ) {
                    url = globals.admin.getOneCompany + companyId;
                } else {
                    throw new Error("Company access is unavailable");
                }

                const response = await jwtAxios.get<Company>(url);

                if (!active) {
                    return;
                }

                if (
                    !response.data ||
                    (
                        response.data.coupons != null &&
                        !Array.isArray(response.data.coupons)
                    )
                ) {
                    throw new Error("Invalid company response");
                }

                setCoupons(response.data.coupons || []);
            } catch {
                if (!active) {
                    return;
                }

                setCoupons([]);
                setErrorMessage(
                    "לא ניתן לטעון את הקופונים של החברה. נסה שוב."
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadCompanyCoupons();

        return () => {
            active = false;
        };
    }, [userType, companyId, retryCount]);

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

    const handleDeletedCoupon = (id: number) => {
        setCoupons(previous =>
            previous.filter(coupon => coupon.id !== id)
        );
    };

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
                    ? "קופונים של החברה"
                    : "הקופונים שלי"}
            </Typography>

            <Paper
                elevation={2}
                sx={{ p: 3, mb: 4, borderRadius: 2 }}
            >
                <Grid
                    container
                    spacing={4}
                    justifyContent="center"
                    alignItems="center"
                >
                    <Grid item xs={12} md={4}>
                        <Typography variant="body2" gutterBottom>
                            מחיר מקסימלי: ₪{displayPrice}
                        </Typography>

                        <Slider
                            value={displayPrice}
                            min={0}
                            max={10000}
                            step={50}
                            onChange={(_, value) => {
                                setDisplayPrice(value as number);
                            }}
                            onChangeCommitted={(_, value) => {
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

            <Box sx={{ minHeight: 300 }}>
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
                        variant="h6"
                        align="center"
                        color="text.secondary"
                        sx={{ mt: 5 }}
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
                                <SingleCoupon
                                    coupon={coupon}
                                    isOwned
                                    updateCoupon={() => {
                                        navigate(
                                            "/company/updateCoupon",
                                            {
                                                state: { coupon }
                                            }
                                        );
                                    }}
                                    onDelete={handleDeletedCoupon}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Container>
    );
}

export default GetAllCompanyCoupons;