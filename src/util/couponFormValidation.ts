
import { format, isValid, parseISO } from "date-fns";

import { Coupon } from "../modal/Coupon";
import { CouponCategory } from "../modal/CouponCategory";

export const MAX_COUPON_AMOUNT = 100000;

function isValidDate(value: unknown): value is string {
    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return false;
    }

    const date = parseISO(value);

    return (
        isValid(date) &&
        format(date, "yyyy-MM-dd") === value
    );
}

export function validateCouponAmount(
    amount: unknown,
    creating: boolean
): string | null {
    if (
        typeof amount !== "number" ||
        !Number.isSafeInteger(amount)
    ) {
        return "יש להזין כמות במספר שלם.";
    }

    if (amount < (creating ? 1 : 0)) {
        return creating
            ? "הכמות חייבת להיות לפחות קופון אחד."
            : "הכמות לא יכולה להיות שלילית.";
    }

    if (amount > MAX_COUPON_AMOUNT) {
        return "הכמות המקסימלית היא 100,000 קופונים.";
    }

    return null;
}

export function validateCouponForm(
    coupon: Partial<Coupon>,
    creating: boolean
): string | null {
    const categories: string[] = Object.values(CouponCategory);

    if (
        !coupon.category ||
        coupon.category === CouponCategory.ALL ||
        !categories.includes(coupon.category)
    ) {
        return "יש לבחור קטגוריה.";
    }

    const title = coupon.title?.trim();

    if (!title || title.length > 25) {
        return "כותרת הקופון חייבת להכיל בין 1 ל־25 תווים.";
    }

    const description = coupon.description?.trim();

    if (!description || description.length > 1024) {
        return "תיאור הקופון חייב להכיל בין 1 ל־1024 תווים.";
    }

    if (
        !isValidDate(coupon.start_date) ||
        !isValidDate(coupon.end_date)
    ) {
        return "יש להזין תאריכי התחלה וסיום תקינים.";
    }

    if (coupon.end_date < coupon.start_date) {
        return "תאריך הסיום לא יכול להיות לפני תאריך ההתחלה.";
    }

    const amountError = validateCouponAmount(
        coupon.amount,
        creating
    );

    if (amountError) {
        return amountError;
    }

    if (
        typeof coupon.price !== "number" ||
        !Number.isFinite(coupon.price) ||
        coupon.price <= 0 ||
        coupon.price > 9999
    ) {
        return "המחיר חייב להיות גדול מאפס ולא לעלות על 9,999 ₪.";
    }

    if ((coupon.image?.trim().length || 0) > 1024) {
        return "קישור התמונה ארוך מדי.";
    }

    return null;
}
