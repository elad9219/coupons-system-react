
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Typography
} from "@mui/material";

import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

import { Coupon } from "../../../modal/Coupon";
import { RootState } from "../../../redux/store";
import { deleteCoupon } from "../../../redux/couponState";
import { couponPurchased } from "../../../redux/customerState";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import notify from "../../../util/notify";
import { getHebrewCategory } from "../../../util/categories";

interface SingleCouponProps {
    coupon?: Coupon;
    updateCoupon?: () => void;
    onDelete?: (id: number) => void;
    isOwned?: boolean;
}

const israelDateFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
});

const priceFormatter = new Intl.NumberFormat("he-IL", {
    maximumFractionDigits: 2
});

function getTodayInIsrael(): string {
    const parts = israelDateFormatter.formatToParts(new Date());

    const year = parts.find(part => part.type === "year")?.value;
    const month = parts.find(part => part.type === "month")?.value;
    const day = parts.find(part => part.type === "day")?.value;

    return `${year}-${month}-${day}`;
}

function formatCouponDate(value: string): string {
    const date = value.substring(0, 10);
    const parts = date.split("-");

    if (parts.length !== 3) {
        return value;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function getRequestError(
    error: unknown,
    fallback: string
): string {
    if (axios.isAxiosError(error)) {
        const data: unknown = error.response?.data;

        if (typeof data === "string" && data.trim()) {
            return data;
        }

        if (data !== null && typeof data === "object") {
            const details = data as Record<string, unknown>;

            if (typeof details.description === "string") {
                return details.description;
            }

            if (typeof details.message === "string") {
                return details.message;
            }
        }

        if (!error.response) {
            return "אין תקשורת עם השרת. נסה שוב בעוד רגע.";
        }
    }

    return fallback;
}

function SingleCoupon({
    coupon,
    updateCoupon,
    onDelete,
    isOwned = false
}: SingleCouponProps): JSX.Element {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const userType = useSelector(
        (state: RootState) => state.authState.userType
    );

    const userId = useSelector(
        (state: RootState) => state.authState.id
    );

    const customer = useSelector(
        (state: RootState) => state.customerState.customer[0]
    );

    const [openDelete, setOpenDelete] = useState(false);
    const [openPurchase, setOpenPurchase] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);

    const purchaseInProgress = useRef(false);
    const deletionInProgress = useRef(false);

    if (!coupon) {
        return <></>;
    }

    const today = getTodayInIsrael();
    const endDate = coupon.end_date?.substring(0, 10) || "";
    const startDate = coupon.start_date?.substring(0, 10) || "";

    const isExpired =
        coupon.expired === true ||
        (endDate !== "" && endDate < today);

    const isNotStarted =
        startDate !== "" && startDate > today;

    const isOutOfStock = coupon.amount <= 0;

    const isPurchasedByCustomer =
        isOwned ||
        (
            userType === "CUSTOMER" &&
            customer?.coupons?.some(
                item => Number(item.id) === Number(coupon.id)
            )
        );

    const isCompanyOwner =
        userType === "COMPANY" &&
        Number(coupon.companyId) === Number(userId);

    const purchaseUnavailable =
        isPurchasedByCustomer ||
        isExpired ||
        isNotStarted ||
        isOutOfStock;

    const imageUrl = coupon.image?.trim() || "";
    const hasImage =
        !imageFailed &&
        /^https?:\/\//i.test(imageUrl) &&
        !/via\.placeholder\.com|placehold\.co/i.test(imageUrl);

    const confirmPurchase = (): void => {
        if (purchaseInProgress.current || purchaseUnavailable) {
            return;
        }

        if (userType !== "CUSTOMER") {
            notify.error("עליך להתחבר כלקוח כדי לרכוש קופון");
            navigate("/login");
            return;
        }

        setOpenPurchase(true);
    };

    const performPurchase = async (): Promise<void> => {
        if (
            purchaseInProgress.current ||
            purchaseUnavailable ||
            userType !== "CUSTOMER"
        ) {
            return;

        }

        purchaseInProgress.current = true;
        setIsPurchasing(true);

        try {
            await jwtAxios.post(
                globals.customer.purchaseCoupon + coupon.id
            );

            dispatch(couponPurchased(coupon));
            setOpenPurchase(false);
            notify.success("נרכש בהצלחה!");
        } catch (error) {
            notify.error(
                getRequestError(error, "שגיאה ברכישת הקופון")
            );
        } finally {
            purchaseInProgress.current = false;
            setIsPurchasing(false);
        }
    };

    const removeCoupon = async (): Promise<void> => {
        if (
            deletionInProgress.current ||
            !isCompanyOwner
        ) {
            return;
        }

        deletionInProgress.current = true;
        setIsDeleting(true);

        try {
            await jwtAxios.delete(
                globals.company.deleteCoupon + coupon.id
            );

            dispatch(deleteCoupon(coupon.id));
            onDelete?.(coupon.id);
            setOpenDelete(false);
            notify.success("קופון נמחק");
        } catch (error) {
            notify.error(
                getRequestError(error, "שגיאה במחיקת הקופון")
            );
        } finally {
            deletionInProgress.current = false;
            setIsDeleting(false);
        }
    };

    const goToUpdate = (): void => {
        if (updateCoupon) {
            updateCoupon();
        } else {
            navigate("/company/updateCoupon", {
                state: { coupon }
            });
        }
    };

    const couponStatus = isExpired
        ? "פג תוקף"
        : isNotStarted
            ? "טרם התחיל"
            : isOutOfStock
                ? "אזל המלאי"
                : "";

    return (
        <Card
            dir="rtl"
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 4,
                boxShadow: "0 8px 28px rgba(20,38,61,0.06)",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 16px 36px rgba(20,38,61,0.12)"
                },
                "@media (prefers-reduced-motion: reduce)": {
                    transition: "none",
                    "&:hover": {
                        transform: "none"
                    }
                }
            }}
        >
            <Box
                sx={{
                    position: "relative",
                    height: 195,
                    overflow: "hidden",
                    bgcolor: "#EAF0FF",
                    flexShrink: 0
                }}
            >
                {hasImage ? (
                    <Box
                        component="img"
                        src={imageUrl}
                        alt={coupon.title}
                        loading="lazy"
                        onError={() => setImageFailed(true)}
                        sx={{
                            display: "block",
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                        }}
                    />
                ) : (
                    <Box
                        role="img"
                        aria-label="תמונת קופון אינה זמינה"
                        sx={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1.5,
                            background:
                                "linear-gradient(135deg, #EAF0FF 0%, #DCE9F6 55%, #E4F8F5 100%)"
                        }}
                    >
                        <Box
                            sx={{
                                width: 76,
                                height: 76,
                                display: "grid",
                                placeItems: "center",
                                borderRadius: "24px",
                                bgcolor: "rgba(255,255,255,0.8)",
                                color: "primary.main",
                                boxShadow:
                                    "0 8px 24px rgba(20,38,61,0.06)"
                            }}
                        >
                            <LocalOfferOutlinedIcon
                                sx={{ fontSize: 39 }}
                            />
                        </Box>
                        <Typography
                            variant="caption"
                            sx={{
                                color: "text.secondary",
                                fontWeight: 700
                            }}
                        >
                            הצעה מיוחדת
                        </Typography>
                    </Box>
                )}

                {couponStatus && (
                    <Chip
                        size="small"
                        label={couponStatus}
                        color={
                            isExpired
                                ? "error"
                                : isNotStarted
                                    ? "warning"
                                    : "default"
                        }
                        sx={{
                            position: "absolute",
                            top: 14,
                            right: 14,
                            fontWeight: 800,
                            boxShadow:
                                "0 4px 12px rgba(0,0,0,0.12)"
                        }}
                    />
                )}

                {!couponStatus && isPurchasedByCustomer && (
                    <Chip
                        size="small"
                        label="כבר נרכש"
                        color="success"
                        sx={{
                            position: "absolute",
                            top: 14,
                            right: 14,
                            fontWeight: 800
                        }}
                    />
                )}
            </Box>

            <CardContent
                sx={{
                    px: 2.5,
                    pt: 2.5,
                    pb: 1,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                <Chip
                    size="small"
                    variant="outlined"
                    icon={<LocalOfferOutlinedIcon />}
                    label={getHebrewCategory(coupon.category)}
                    sx={{
                        alignSelf: "flex-start",
                        mb: 1.5,
                        borderColor: "#D8E4F5",
                        color: "primary.dark",
                        bgcolor: "#F7F9FF"
                    }}
                />

                <Typography
                    variant="h6"
                    sx={{
                        color: "text.primary",
                        fontSize: "1.1rem",
                        fontWeight: 800,
                        mb: 1,
                        lineHeight: 1.35,
                        minHeight: 29
                    }}
                >
                    {coupon.title}
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        color: "text.secondary",
                        lineHeight: 1.65,
                        minHeight: 47,
                        mb: 2.5,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical"
                    }}
                >
                    {coupon.description || "הצעה מיוחדת לזמן מוגבל"}
                </Typography>

                <Box sx={{ mt: "auto" }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "baseline",
                            justifyContent: "space-between",
                            gap: 1,
                            mb: 1.5
                        }}
                    >
                        <Box>
                            <Typography
                                variant="caption"
                                sx={{
                                    display: "block",
                                    color: "text.secondary",
                                    mb: 0.3
                                }}
                            >
                                מחיר הקופון
                            </Typography>

                            <Typography
                                variant="h5"
                                sx={{
                                    color: "primary.main",
                                    fontWeight: 900,
                                    lineHeight: 1.2
                                }}
                            >
                                ₪{priceFormatter.format(coupon.price)}
                            </Typography>
                        </Box>

                        {isCompanyOwner && (
                            <Typography
                                variant="caption"
                                sx={{
                                    color: "text.secondary",
                                    fontWeight: 600
                                }}
                            >
                                מלאי: {coupon.amount}
                            </Typography>
                        )}
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                            color: "text.secondary",
                            pt: 1.5,
                            borderTop: "1px solid",
                            borderColor: "divider"
                        }}
                    >
                        <CalendarTodayOutlinedIcon
                            sx={{ fontSize: 15 }}
                        />

                        <Typography variant="caption">
                            בתוקף עד: {formatCouponDate(coupon.end_date)}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>

            <CardActions
                sx={{
                    display: "flex",
                    gap: 1,
                    px: 2.5,
                    pb: 2.5,
                    pt: 2
                }}
            >
                {isCompanyOwner && (
                    <>
                        <Button
                            variant="outlined"
                            startIcon={<EditOutlinedIcon />}
                            onClick={goToUpdate}
                            fullWidth
                            sx={{ flexGrow: 1 }}
                        >
                            עדכן
                        </Button>

                        <IconButton
                            color="error"
                            aria-label="מחק קופון"
                            disabled={isDeleting}
                            onClick={() => setOpenDelete(true)}
                            sx={{
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 2.5
                            }}
                        >
                            <DeleteOutlineRoundedIcon />
                        </IconButton>
                    </>
                )}

                {(userType === "CUSTOMER" || !userType) && (
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={confirmPurchase}
                        disabled={
                            Boolean(purchaseUnavailable) ||
                            isPurchasing
                        }
                        startIcon={
                            !purchaseUnavailable
                                ? <ShoppingBagOutlinedIcon />
                                : undefined
                        }
                        color={
                            isPurchasedByCustomer
                                ? "success"
                                : "primary"
                        }
                        sx={{
                            minHeight: 44,
                            fontWeight: 800
                        }}
                    >
                        {isPurchasedByCustomer
                            ? "נרכש"
                            : isExpired
                                ? "פג תוקף"
                                : isNotStarted
                                    ? "טרם התחיל"
                                    : isOutOfStock
                                        ? "אזל המלאי"
                                        : "רכישה"}
                    </Button>
                )}

                {isExpired &&
                    !isCompanyOwner &&
                    userType !== "CUSTOMER" &&
                    Boolean(userType) && (
                        <Button fullWidth disabled>
                            לא זמין לרכישה
                        </Button>
                    )}
            </CardActions>

            <Dialog
                open={openDelete}
                onClose={() => {
                    if (!isDeleting) {
                        setOpenDelete(false);
                    }
                }}
                dir="rtl"
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle sx={{ fontWeight: 800 }}>
                    מחיקת קופון
                </DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        למחוק את "{coupon.title}"?
                    </DialogContentText>
                </DialogContent>

                <DialogActions sx={{ p: 2.5 }}>
                    <Button
                        disabled={isDeleting}
                        onClick={() => setOpenDelete(false)}
                    >
                        ביטול
                    </Button>

                    <Button
                        disabled={isDeleting}
                        onClick={removeCoupon}
                        variant="contained"
                        color="error"
                    >
                        {isDeleting ? "מוחק..." : "מחק"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openPurchase}
                onClose={() => {
                    if (!isPurchasing) {
                        setOpenPurchase(false);
                    }
                }}
                dir="rtl"
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle sx={{ fontWeight: 800 }}>
                    אישור רכישה
                </DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        האם לרכוש את הקופון{" "}
                        <strong>{coupon.title}</strong>{" "}
                        במחיר{" "}
                        <strong>
                            ₪{priceFormatter.format(coupon.price)}
                        </strong>
                        ?
                    </DialogContentText>
                </DialogContent>

                <DialogActions sx={{ p: 2.5 }}>
                    <Button
                        disabled={isPurchasing}
                        onClick={() => setOpenPurchase(false)}
                    >
                        ביטול
                    </Button>

                    <Button
                        disabled={isPurchasing}
                        onClick={performPurchase}
                        variant="contained"
                        color="primary"
                        startIcon={
                            isPurchasing
                                ? (
                                    <CircularProgress
                                        size={16}
                                        color="inherit"
                                    />
                                )
                                : undefined
                        }
                    >
                        {isPurchasing
                            ? "מבצע רכישה..."
                            : "אישור ורכישה"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}

export default SingleCoupon;
