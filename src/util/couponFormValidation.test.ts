
import { Coupon } from "../modal/Coupon";
import { validateCouponForm } from "./couponFormValidation";

const validCoupon: Partial<Coupon> = {
    category: "FOOD",
    title: "Valid coupon",
    description: "A valid description",
    start_date: "2030-01-10",
    end_date: "2030-01-20",
    amount: 10,
    price: 100
};

describe("Coupon form validation", () => {
    test("accepts a valid coupon without an image", () => {
        expect(
            validateCouponForm(validCoupon, true)
        ).toBeNull();
    });

    test("requires a description", () => {
        expect(
            validateCouponForm({
                ...validCoupon,
                description: " "
            }, true)
        ).toMatch(/תיאור/);
    });

    test("enforces the backend title length", () => {
        expect(
            validateCouponForm({
                ...validCoupon,
                title: "A".repeat(26)
            }, true)
        ).toMatch(/25/);
    });

    test("rejects an invalid date range", () => {
        expect(
            validateCouponForm({
                ...validCoupon,
                start_date: "2030-01-20",
                end_date: "2030-01-10"
            }, true)
        ).toMatch(/תאריך הסיום/);
    });

    test("accepts equal start and end dates", () => {
        expect(
            validateCouponForm({
                ...validCoupon,
                end_date: validCoupon.start_date
            }, true)
        ).toBeNull();
    });

    test("rejects zero stock when creating", () => {
        expect(
            validateCouponForm({
                ...validCoupon,
                amount: 0
            }, true)
        ).toMatch(/כמות/);
    });

    test("allows zero stock when updating", () => {
        expect(
            validateCouponForm({
                ...validCoupon,
                amount: 0
            }, false)
        ).toBeNull();
    });

    test("rejects prices above the backend limit", () => {
        expect(
            validateCouponForm({
                ...validCoupon,
                price: 10000
            }, true)
        ).toMatch(/9,999/);
    });

    test("rejects an invalid calendar date", () => {
        expect(
            validateCouponForm({
                ...validCoupon,
                start_date: "2030-02-30"
            }, true)
        ).toMatch(/תאריכי/);
    });
});
