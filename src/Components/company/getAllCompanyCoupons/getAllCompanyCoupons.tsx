
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

import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";

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

const MAX_PRICE = 10000;

const priceFormatter = new Intl.NumberFormat("he-IL");

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
    const [displayPrice, setDisplayPrice] = useState(MAX_PRICE);
    const [maxPrice, setMaxPrice] = useState(MAX_PRICE);

    const [category, setCategory] = useState<CouponCategory>(
        CouponCategory.ALL
    );

    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let active = true;

        const loadCompanyCoupons = async (): Promise<void> => {
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

    const filtersChanged =
        maxPrice !== MAX_PRICE ||
        category !== CouponCategory.ALL;

    const resetFilters = (): void => {
        setDisplayPrice(MAX_PRICE);
        setMaxPrice(MAX_PRICE);
        setCategory(CouponCategory.ALL);
    };

    const handleDeletedCoupon = (id: number): void => {
        setCoupons(previous =>
            previous.filter(coupon => coupon.id !== id)
        );
    };

    return (
        <Container
            maxWidth="xl"
            dir="rtl"
            sx={{
                mt: { xs: 3, md: 4 },
                mb: 5,
                px: { xs: 1, sm: 2, md: 3 }
            }}
        >
            <Box sx={{ mb: 3 }}>
                <Typography
                    component="h1"
                    variant="h4"
                    align="center"
                    color="primary"
                    sx={{ mb: 0.75, fontWeight: 800 }}
                >
                    {userType === "ADMIN"
                        ? "קופונים של החברה"
                        : "הקופונים שלי"}
                </Typography>

                {!loading && !errorMessage && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                    >
                        {`מציגים ${filteredCoupons.length} מתוך ${coupons.length} קופונים`}
                    </Typography>
                )}
            </Box>

            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 2.5, md: 3 },
                    mb: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 8px 26px rgba(20,38,61,0.04)"
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        flexWrap: "wrap",
                        mb: 2.5
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1
                        }}
                    >
                        <Box
                            sx={{
                                width: 35,
                                height: 35,
                                display: "grid",
                                placeItems: "center",
                                borderRadius: 2,
                                bgcolor: "primary.light",
                                color: "primary.main"
                            }}
                        >
                            <TuneRoundedIcon fontSize="small" />
                        </Box>

                        <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 800 }}
                        >
                            סינון קופונים
                        </Typography>
                    </Box>

                    <Button
                        size="small"
                        color="inherit"
                        disabled={!filtersChanged}
                        onClick={resetFilters}
                        startIcon={<RestartAltRoundedIcon />}
                        sx={{ color: "text.secondary" }}
                    >
                        איפוס מסננים
                    </Button>
                </Box>

                <Grid
                    container
                    spacing={2.5}
                    alignItems="center"
                >
                    <Grid item xs={12} md={7}>
                        <Box
                            sx={{
                                bgcolor: "#F7F9FD",
                                border: "1px solid #EBEFF6",
                                borderRadius: 3,
                                px: 2,
                                py: 1.5
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 1
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    fontWeight={700}
                                >
                                    מחיר מקסימלי
                                </Typography>

                                <Typography
                                    color="primary.main"
                                    fontWeight={800}
                                >
                                    ₪{priceFormatter.format(displayPrice)}
                                </Typography>
                            </Box>

                            <Slider
                                aria-label="מחיר מקסימלי"
                                value={displayPrice}
                                min={0}
                                max={MAX_PRICE}
                                step={50}
                                valueLabelDisplay="auto"
                                onChange={(_, value) => {
                                    setDisplayPrice(value as number);
                                }}
                                onChangeCommitted={(_, value) => {
                                    setMaxPrice(value as number);
                                }}
                                sx={{
                                    direction: "ltr",
                                    color: "primary.main",
                                    height: 6,
                                    "& .MuiSlider-thumb": {
                                        width: 18,
                                        height: 18,
                                        bgcolor: "#FFFFFF",
                                        border: "5px solid",
                                        borderColor: "primary.main"
                                    }
                                }}
                            />

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    ₪0
                                </Typography>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    ₪10,000
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <FormControl fullWidth>
                            <InputLabel id="company-category-label">
                                קטגוריה
                            </InputLabel>

                            <Select
                                labelId="company-category-label"
                                label="קטגוריה"
                                value={category}
                                onChange={event => {
                                    setCategory(
                                        event.target.value as CouponCategory
                                    );
                                }}
                            >
                                <MenuItem value={CouponCategory.ALL}>
                                    כל הקטגוריות
                                </MenuItem>

                                {Object.values(CouponCategory)
                                    .filter(
                                        item =>
                                            item !== CouponCategory.ALL
                                    )
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
                        role="alert"
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
                            py: 5,
                            px: 3,
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
                            sx={{ mb: 1, fontWeight: 800 }}
                        >
                            לא נמצאו קופונים
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{ mb: 2 }}
                        >
                            אפשר לשנות את הקטגוריה או את
                            המחיר המקסימלי.
                        </Typography>

                        <Button
                            variant="outlined"
                            onClick={resetFilters}
                            disabled={!filtersChanged}
                        >
                            נקה מסננים
                        </Button>
                    </Paper>
                ) : (
                    <Grid container spacing={2.5}>
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
