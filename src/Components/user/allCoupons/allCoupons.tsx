
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

type CatalogSort =
    | "newest"
    | "price_asc"
    | "price_desc"
    | "title";

interface CatalogResponse {
    content: Coupon[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

const PAGE_SIZE = 12;

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

                    dispatch(
                        downloadSingleCustomer([profile])
                    );
                }

                const response =
                    await jwtAxios.get<CatalogResponse>(
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

                // Data may have changed since the last page load.
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
                if (active) {
                    setLoading(false);
                }
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
        setPage(0);
        setMaxPrice(newValue as number);
    };

    const firstResult =
        totalElements === 0 ? 0 : page * PAGE_SIZE + 1;

    const lastResult = Math.min(
        (page + 1) * PAGE_SIZE,
        totalElements
    );

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

            <Paper
                elevation={2}
                sx={{ p: 3, mb: 3, borderRadius: 3 }}
            >
                <Grid
                    container
                    spacing={3}
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
                            <Box
                                component="span"
                                color="primary.main"
                            >
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
                                sx={{
                                    direction: "ltr",
                                    height: 8
                                }}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3.5}>
                        <FormControl fullWidth>
                            <InputLabel>קטגוריה</InputLabel>

                            <Select
                                value={category}
                                label="קטגוריה"
                                onChange={event => {
                                    setCategory(
                                        event.target.value as CouponCategory
                                    );
                                    setPage(0);
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

                    <Grid item xs={12} sm={6} md={3.5}>
                        <FormControl fullWidth>
                            <InputLabel>מיון</InputLabel>

                            <Select
                                value={sort}
                                label="מיון"
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

            {!loading && !errorMessage && totalElements > 0 && (
                <Typography
                    color="text.secondary"
                    sx={{ mb: 2, textAlign: "right" }}
                >
                    מציג {firstResult}–{lastResult} מתוך{" "}
                    {totalElements} קופונים
                </Typography>
            )}

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
            ) : coupons.length === 0 ? (
                <Typography
                    align="center"
                    color="text.secondary"
                    sx={{ mt: 4 }}
                >
                    לא נמצאו קופונים התואמים את הסינון.
                </Typography>
            ) : (
                <>
                    <Grid container spacing={3}>
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
                                mt: 4,
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
