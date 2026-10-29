import { Coupon } from "../modal/Coupon";
import {
    addCoupon,
    couponReducer,
    couponState,
    deleteCoupon,
    downloadCoupons,
    downloadSingleCoupon,
    getSingleCoupon,
    updateCoupon
} from "./couponState";

const firstCoupon: Coupon = {
    id: 1,
    companyId: 5,
    category: "FOOD",
    title: "First coupon",
    start_date: "2025-01-01",
    end_date: "2099-12-31",
    amount: 5,
    price: 100
};

const secondCoupon: Coupon = {
    ...firstCoupon,
    id: 2,
    title: "Second coupon",
    price: 200
};

describe("couponReducer", () => {
    test("starts with an empty collection", () => {
        const state = couponReducer(
            undefined,
            { type: "UNKNOWN" as any }
        );

        expect(state.coupon).toEqual([]);
        expect(state.singleCoupon).toBeNull();
        expect(state.singleCouponId).toBeNull();
    });

    test("downloads coupons", () => {
        const state = couponReducer(
            new couponState(),
            downloadCoupons([firstCoupon, secondCoupon])
        );

        expect(state.coupon).toHaveLength(2);
        expect(state.coupon[0].id).toBe(1);
        expect(state.coupon[1].id).toBe(2);
    });

    test("adds a coupon without mutating the previous state", () => {
        const previous = couponReducer(
            undefined,
            downloadCoupons([firstCoupon])
        );

        const next = couponReducer(
            previous,
            addCoupon(secondCoupon)
        );

        expect(previous.coupon).toHaveLength(1);
        expect(next.coupon).toHaveLength(2);
    });

    test("updates the matching coupon only", () => {
        const previous = couponReducer(
            undefined,
            downloadCoupons([firstCoupon, secondCoupon])
        );

        const updated = {
            ...firstCoupon,
            price: 150
        };

        const next = couponReducer(
            previous,
            updateCoupon(updated)
        );

        expect(next.coupon[0].price).toBe(150);
        expect(next.coupon[1].price).toBe(200);
        expect(previous.coupon[0].price).toBe(100);
    });

    test("deletes a coupon without deleting others", () => {
        const previous = couponReducer(
            undefined,
            downloadCoupons([firstCoupon, secondCoupon])
        );

        const next = couponReducer(
            previous,
            deleteCoupon(1)
        );

        expect(next.coupon.map(item => item.id)).toEqual([2]);
        expect(previous.coupon).toHaveLength(2);
    });

    test("updates an existing coupon from an array payload", () => {
        const previous = couponReducer(
            undefined,
            downloadCoupons([firstCoupon, secondCoupon])
        );

        const updated = {
            ...firstCoupon,
            title: "Updated title"
        };

        const next = couponReducer(
            previous,
            downloadSingleCoupon([updated])
        );

        expect(next.coupon).toHaveLength(2);
        expect(next.coupon[0].title).toBe("Updated title");
        expect(next.coupon[1].title).toBe("Second coupon");
    });

    test("inserts a previously missing coupon", () => {
        const next = couponReducer(
            undefined,
            downloadSingleCoupon(secondCoupon)
        );

        expect(next.coupon).toEqual([secondCoupon]);
    });

    test("selects a coupon by its ID", () => {
        const previous = couponReducer(
            undefined,
            downloadCoupons([firstCoupon, secondCoupon])
        );

        const next = couponReducer(
            previous,
            getSingleCoupon(2)
        );

        expect(next.singleCoupon).toEqual(secondCoupon);
        expect(next.singleCouponId).toBe(2);
        expect(next.coupon).toEqual([secondCoupon]);
    });

    test("accepts a coupon object when selecting", () => {
        const previous = couponReducer(
            undefined,
            downloadCoupons([firstCoupon, secondCoupon])
        );

        const next = couponReducer(
            previous,
            getSingleCoupon(firstCoupon)
        );

        expect(next.singleCoupon?.id).toBe(1);
    });

    test("clears the selection when the selected coupon is deleted", () => {
        const loaded = couponReducer(
            undefined,
            downloadCoupons([firstCoupon])
        );

        const selected = couponReducer(
            loaded,
            getSingleCoupon(1)
        );

        const next = couponReducer(
            selected,
            deleteCoupon(1)
        );

        expect(next.coupon).toEqual([]);
        expect(next.singleCoupon).toBeNull();
        expect(next.singleCouponId).toBeNull();
    });
});