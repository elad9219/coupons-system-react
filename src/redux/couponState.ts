import { Coupon } from "../modal/Coupon";

export class couponState {
    coupon: Coupon[] = [];
    singleCoupon: Coupon | null = null;
    singleCouponId: number | null = null;
}

export enum couponActionType {
    DownloadCoupons = "DownloadCoupons",
    DeleteCoupon = "DeleteCoupon",
    UpdateCoupon = "UpdateCoupon",
    AddCoupon = "AddCoupon",
    DownloadSingleCoupon = "DownloadSingleCoupon",
    GetSingleCoupon = "GetSingleCoupon"
}

export interface CouponAction {
    type: couponActionType;
    payload?: any;
}

export function downloadCoupons(coupons: Coupon[]): CouponAction {
    return {
        type: couponActionType.DownloadCoupons,
        payload: coupons
    };
}

export function deleteCoupon(couponId: number): CouponAction {
    return {
        type: couponActionType.DeleteCoupon,
        payload: couponId
    };
}

export function updateCoupon(coupon: Coupon): CouponAction {
    return {
        type: couponActionType.UpdateCoupon,
        payload: coupon
    };
}

export function addCoupon(coupon: Coupon): CouponAction {
    return {
        type: couponActionType.AddCoupon,
        payload: coupon
    };
}

export function downloadSingleCoupon(
    coupon: Coupon | Coupon[]
): CouponAction {
    return {
        type: couponActionType.DownloadSingleCoupon,
        payload: coupon
    };
}

export function getSingleCoupon(
    couponOrId: Coupon | number
): CouponAction {
    return {
        type: couponActionType.GetSingleCoupon,
        payload: couponOrId
    };
}

export function couponReducer(
    currentState: couponState = new couponState(),
    action: CouponAction
): couponState {
    switch (action.type) {
        case couponActionType.DownloadCoupons:
            return {
                ...currentState,
                coupon: action.payload || []
            };

        case couponActionType.AddCoupon:
            return {
                ...currentState,
                coupon: [
                    ...currentState.coupon,
                    action.payload
                ]
            };

        case couponActionType.DeleteCoupon: {
            const deletedId = Number(action.payload);

            return {
                ...currentState,
                coupon: currentState.coupon.filter(
                    item => item.id !== deletedId
                ),
                singleCoupon:
                    currentState.singleCoupon?.id === deletedId
                        ? null
                        : currentState.singleCoupon,
                singleCouponId:
                    currentState.singleCouponId === deletedId
                        ? null
                        : currentState.singleCouponId
            };
        }

        case couponActionType.UpdateCoupon: {
            const updatedCoupon = action.payload as Coupon;

            return {
                ...currentState,
                coupon: currentState.coupon.map(item =>
                    item.id === updatedCoupon.id
                        ? updatedCoupon
                        : item
                ),
                singleCoupon:
                    currentState.singleCoupon?.id === updatedCoupon.id
                        ? updatedCoupon
                        : currentState.singleCoupon
            };
        }

        case couponActionType.DownloadSingleCoupon: {
            const incoming = Array.isArray(action.payload)
                ? action.payload as Coupon[]
                : [action.payload as Coupon];

            const coupons = [...currentState.coupon];

            for (const item of incoming) {
                if (!item || typeof item.id !== "number") {
                    continue;
                }

                const index = coupons.findIndex(
                    existing => existing.id === item.id
                );

                if (index >= 0) {
                    coupons[index] = item;
                } else {
                    coupons.push(item);
                }
            }

            const selected = currentState.singleCoupon;

            return {
                ...currentState,
                coupon: coupons,
                singleCoupon: selected
                    ? coupons.find(item => item.id === selected.id) || null
                    : null
            };
        }

        case couponActionType.GetSingleCoupon: {
            const payload = action.payload as Coupon | number;

            const couponId =
                typeof payload === "number"
                    ? payload
                    : payload?.id;

            const foundCoupon = currentState.coupon.find(
                item => item.id === couponId
            ) || null;

            return {
                ...currentState,
                coupon: foundCoupon ? [foundCoupon] : [],
                singleCoupon: foundCoupon,
                singleCouponId: foundCoupon ? foundCoupon.id : null
            };
        }

        default:
            return currentState;
    }
}