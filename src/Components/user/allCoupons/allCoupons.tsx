
import { useEffect, useState } from "react";
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
    Pagination,
    Paper,
    Select,
    Slider,
    Typography
} from "@mui/material";

import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";

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

type CatalogSort = "newest" | "price_asc" | "price_desc" | "title";

interface CatalogResponse {
    content: Coupon[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

const PAGE_SIZE = 12;
const MAX_PRICE = 10000;
const budgetOptions = [500, 2000, 5000, 10000];

const priceFormatter = new Intl.NumberFormat("he-IL");

function AllCoupons(): JSX.Element {
    const dispatch = useDispatch();

    const userType = useSelector(
        (state: RootState) => state.authState.userType
    );

    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
    const [displayPrice, setDisplayPrice] = useState(MAX_PRICE);
    const [category, setCategory] = useState<CouponCategory>(
        CouponCategory.ALL
    );
    const [sort, setSort] = useState<CatalogSort>("newest");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let active = true;

        const loadCatalog = async (): Promise<void> => {
            setLoading(true);
            setErrorMessage("");

            try {
                if (userType === "CUSTOMER") {
                    const profileResponse =
                        await jwtAxios.get<Customer>(
                            globals.customer.getCustomerDetails
                        );

                    if (!active) return;

                    const profile = profileResponse.data;

                    if (
                        !profile ||
                        typeof profile.id !== "number" ||
                        profile.id <= 0
                    ) {
                        throw new Error("Invalid customer profile");
                    }

                    dispatch(downloadSingleCustomer([profile]));
                }

                const response = await jwtAxios.get<CatalogResponse>(
                    globals.guest.catalog,
                    {
                        params: {
                            page,
                            size: PAGE_SIZE,
                            category:
                                category === CouponCategory.ALL
                                    ? undefined
                                    : category,
                            maxPrice,
                            sort
                        }
                    }
                );

                if (!active) return;

                const result = response.data;

                if (
                    !result ||
                    !Array.isArray(result.content) ||
                    !Number.isInteger(result.page) ||
                    !Number.isInteger(result.totalPages) ||
                    !Number.isInteger(result.totalElements) ||
                    result.totalPages < 0 ||
                    result.totalElements < 0
                ) {
                    throw new Error("Invalid catalog response");
                }

                if (
                    result.totalPages > 0 &&
                    page >= result.totalPages
                ) {
                    setPage(result.totalPages - 1);
                    return;
                }

                setCoupons(result.content);
                setTotalPages(result.totalPages);
                setTotalElements(result.totalElements);
            } catch {
                if (!active) return;

                setCoupons([]);
                setTotalPages(0);
                setTotalElements(0);
                setErrorMessage(
                    "לא הצלחנו לטעון את הקופונים כרגע. בדוק את החיבור ונסה שוב."
                );
            } finally {
                if (active) setLoading(false);
            }
        };

        void loadCatalog();

        return () => {
            active = false;
        };
    }, [
        category,
        maxPrice,
        sort,
        page,
        userType,
        retryCount,
        dispatch
    ]);

    const applyBudget = (price: number): void => {
        setDisplayPrice(price);
        setMaxPrice(price);
        setPage(0);
    };

    const resetFilters = (): void => {
        setCategory(CouponCategory.ALL);
        setSort("newest");
        applyBudget(MAX_PRICE);
    };

    const filtersChanged =
        category !== CouponCategory.ALL ||
        maxPrice !== MAX_PRICE ||
        sort !== "newest";

    const firstResult =
        totalElements === 0 ? 0 : page * PAGE_SIZE + 1;

    const lastResult = Math.min(
        (page + 1) * PAGE_SIZE,
        totalElements
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
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: { xs: 3, md: 4 },
                    px: { xs: 2.5, sm: 4, md: 5 },
                    py: { xs: 3, md: 3.5 },
                    mb: 2.5,
                    background:
                        "linear-gradient(115deg, #14263D 0%, #254C7C 72%, #28678D 100%)",
                    color: "#FFFFFF"
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        width: 190,
                        height: 190,
                        borderRadius: "50%",
                        top: -115,
                        left: -40,
                        bgcolor: "rgba(255,255,255,0.06)"
                    }}
                />

                <Box sx={{ position: "relative", zIndex: 1 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                            color: "#A7ECE5"
                        }}
                    >
                        <LocalOfferRoundedIcon fontSize="small" />
                        <Typography variant="body2" fontWeight={800}>
                            ההטבות מחכות לך
                        </Typography>
                    </Box>

                    <Typography
                        component="h1"
                        sx={{
                            fontWeight: 900,
                            fontSize: {
                                xs: "1.7rem",
                                sm: "2.1rem",
                                md: "2.45rem"
                            },
                            lineHeight: 1.25,
                            mb: 1,
                            color: "#FFFFFF"
                        }}
                    >
                        כל הקופונים במקום אחד
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{
                            color: "#D9E7F5",
                            lineHeight: 1.8
                        }}
                    >
                        בחר קטגוריה, קבע תקציב ומצא את הקופון המתאים.
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
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 1,
                        mb: 2
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
                                display: "grid",
                                placeItems: "center",
                                width: 34,
                                height: 34,
                                bgcolor: "primary.light",
                                color: "primary.main",
                                borderRadius: 2
                            }}
                        >
                            <TuneRoundedIcon fontSize="small" />
                        </Box>

                        <Typography
                            variant="subtitle1"
                            fontWeight={800}
                        >
                            מצא את ההטבה שלך
                        </Typography>
                    </Box>

                    <Button
                        size="small"
                        color="inherit"
                        onClick={resetFilters}
                        disabled={!filtersChanged}
                        sx={{
                            color: "text.secondary",
                            whiteSpace: "nowrap",
                            px: 1.5
                        }}
                    >
                        איפוס מסננים
                    </Button>
                </Box>

                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <Box
                            sx={{
                                bgcolor: "#F7F9FD",
                                border: "1px solid #EBEFF6",
                                borderRadius: 2.5,
                                px: 2,
                                py: 1.5
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 0.5,
                                    gap: 1
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    fontWeight={700}
                                >
                                    עד איזה מחיר?
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="primary.main"
                                    fontWeight={900}
                                >
                                    ₪{priceFormatter.format(displayPrice)}
                                </Typography>
                            </Box>

                            <Box sx={{ px: 2, pt: 0.5, pb: 0.5 }}>
                                <Slider
                                    aria-label="מחיר מקסימלי"
                                    value={displayPrice}
                                    min={0}
                                    max={MAX_PRICE}
                                    step={100}
                                    onChange={(_, value) => {
                                        setDisplayPrice(value as number);
                                    }}
                                    onChangeCommitted={(_, value) => {
                                        setPage(0);
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
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 1,
                                    flexWrap: "wrap",
                                    mt: 0.5
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    בחירה מהירה:
                                </Typography>

                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 0.5,
                                        flexWrap: "wrap"
                                    }}
                                >
                                    {budgetOptions.map(price => (
                                        <Button
                                            key={price}
                                            size="small"
                                            variant={
                                                maxPrice === price
                                                    ? "contained"
                                                    : "text"
                                            }
                                            onClick={() => applyBudget(price)}
                                            sx={{
                                                minHeight: 28,
                                                minWidth: 0,
                                                px: 1,
                                                fontSize: "0.75rem"
                                            }}
                                        >
                                            {price === MAX_PRICE
                                                ? "הכול"
                                                : `₪${priceFormatter.format(price)}`}
                                        </Button>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3.5}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="catalog-category-label">
                                קטגוריה
                            </InputLabel>

                            <Select
                                labelId="catalog-category-label"
                                label="קטגוריה"
                                value={category}
                                onChange={event => {
                                    setCategory(
                                        event.target.value as CouponCategory
                                    );
                                    setPage(0);
                                }}
                            >
                                {Object.values(CouponCategory).map(item => (
                                    <MenuItem key={item} value={item}>
                                        {item === CouponCategory.ALL
                                            ? "כל הקטגוריות"
                                            : getHebrewCategory(item)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3.5}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="catalog-sort-label">
                                מיון
                            </InputLabel>

                            <Select
                                labelId="catalog-sort-label"
                                label="מיון"
                                value={sort}
                                onChange={event => {
                                    setSort(
                                        event.target.value as CatalogSort
                                    );
                                    setPage(0);
                                }}
                            >
                                <MenuItem value="newest">
                                    החדשים ביותר
                                </MenuItem>
                                <MenuItem value="price_asc">
                                    מהזול ליקר
                                </MenuItem>
                                <MenuItem value="price_desc">
                                    מהיקר לזול
                                </MenuItem>
                                <MenuItem value="title">
                                    לפי שם
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    flexWrap: "wrap",
                    gap: 1,
                    mb: 2
                }}
            >
                <Box>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 850,
                            color: "text.primary"
                        }}
                    >
                        הקופונים שלנו
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {loading
                            ? "מעדכנים את הקופונים עבורך..."
                            : errorMessage
                                ? "לא ניתן להציג תוצאות כרגע"
                                : `נמצאו ${priceFormatter.format(totalElements)} קופונים`}
                    </Typography>
                </Box>

                {!loading && !errorMessage && totalElements > 0 && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        מציג {firstResult}–{lastResult} מתוך {totalElements}
                    </Typography>
                )}
            </Box>

            {loading ? (
                <LoadingSpinner />
            ) : errorMessage ? (
                <Box sx={{ maxWidth: 650, mx: "auto", py: 4 }}>
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
            ) : coupons.length === 0 ? (
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
                        לא נמצאו קופונים התואמים את הסינון.
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        אפשר לנסות קטגוריה אחרת או להגדיל את התקציב.
                    </Typography>

                    <Button
                        variant="outlined"
                        onClick={resetFilters}
                        sx={{ whiteSpace: "nowrap" }}
                    >
                        נקה מסננים
                    </Button>
                </Paper>
            ) : (
                <>
                    <Grid container spacing={2.5}>
                        {coupons.map(coupon => (
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

                    {totalPages > 1 && (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                mt: 5,
                                mb: 2,
                                direction: "ltr"
                            }}
                        >
                            <Pagination
                                count={totalPages}
                                page={page + 1}
                                onChange={(_, selectedPage) => {
                                    setPage(selectedPage - 1);
                                }}
                                color="primary"
                                size="large"
                                showFirstButton
                                showLastButton
                            />
                        </Box>
                    )}
                </>
            )}
        </Container>
    );
}

export default AllCoupons;
