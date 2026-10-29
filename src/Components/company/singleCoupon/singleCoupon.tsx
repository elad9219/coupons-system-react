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
    CardMedia,
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
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

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

    const confirmPurchase = () => {
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

    const goToUpdate = () => {
        if (updateCoupon) {
            updateCoupon();
        } else {
            navigate("/company/updateCoupon", {
                state: { coupon }
            });
        }
    };

    return (
        <Card
            dir="rtl"
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                borderRadius: 3,
                border: isExpired ? "1px solid #ffcdd2" : "none",
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.02)" }
            }}
        >
            {isExpired && (
                <Chip
                    label="פג תוקף"
                    color="error"
                    size="small"
                    sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        zIndex: 2,
                        fontWeight: "bold"
                    }}
                />
            )}

            {!isExpired && isNotStarted && (
                <Chip
                    label="טרם התחיל"
                    color="warning"
                    size="small"
                    sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        zIndex: 2
                    }}
                />
            )}

            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    opacity: isExpired ? 0.6 : 1,
                    filter: isExpired ? "grayscale(0.8)" : "none"
                }}
            >
                <CardMedia
                    component="img"
                    height="180"
                    image={
                        coupon.image ||
                        "https://via.placeholder.com/200"
                    }
                    alt={coupon.title}
                />

                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: "bold",
                            fontSize: "1.1rem",
                            lineHeight: 1.2,
                            mb: 1
                        }}
                    >
                        {coupon.title}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mb: 2,
                            minHeight: 40,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical"
                        }}
                    >
                        {coupon.description}
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mt: "auto"
                        }}
                    >
                        <Typography
                            variant="h6"
                            color="primary"
                            fontWeight="bold"
                        >
                            ₪{coupon.price}
                        </Typography>

                        <Chip
                            label={getHebrewCategory(coupon.category)}
                            size="small"
                            variant="outlined"
                        />
                    </Box>

                    <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 1, color: "#888" }}
                    >
                        בתוקף עד: {formatCouponDate(coupon.end_date)}
                    </Typography>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                    {isCompanyOwner && (
                        <Box sx={{ width: "100%", display: "flex", gap: 1 }}>
                            <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={goToUpdate}
                                fullWidth
                            >
                                עדכן
                            </Button>

                            <IconButton
                                color="error"
                                aria-label="מחק קופון"
                                disabled={isDeleting}
                                onClick={() => setOpenDelete(true)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
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
                            color={
                                isPurchasedByCustomer
                                    ? "success"
                                    : "primary"
                            }
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

                    {isExpired && !isCompanyOwner &&
                        userType !== "CUSTOMER" && Boolean(userType) && (
                            <Button fullWidth disabled>
                                לא זמין לרכישה
                            </Button>
                        )}
                </CardActions>
            </Box>

            <Dialog
                open={openDelete}
                onClose={() => {
                    if (!isDeleting) setOpenDelete(false);
                }}
                dir="rtl"
            >
                <DialogTitle>מחיקת קופון</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        למחוק את "{coupon.title}"?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        disabled={isDeleting}
                        onClick={() => setOpenDelete(false)}
                    >
                        ביטול
                    </Button>
                    <Button
                        disabled={isDeleting}
                        onClick={removeCoupon}
                        color="error"
                        variant="contained"
                    >
                        {isDeleting ? "מוחק..." : "מחק"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openPurchase}
                onClose={() => {
                    if (!isPurchasing) setOpenPurchase(false);
                }}
                dir="rtl"
            >
                <DialogTitle sx={{ fontWeight: "bold" }}>
                    אישור רכישה
                </DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        האם לרכוש את הקופון{" "}
                        <strong>{coupon.title}</strong>{" "}
                        במחיר <strong>₪{coupon.price}</strong>?
                    </DialogContentText>
                </DialogContent>

                <DialogActions>
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
                                ? <CircularProgress
                                    size={16}
                                    color="inherit"
                                />
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