import { CouponCategory } from "../modal/CouponCategory";

export const categoryHebrew: Record<string, string> = {
    "FOOD": "אוכל",
    "VACATION": "חופשה",
    "HOTELS": "מלונות",
    "ELECTRICITY": "חשמל",
    "RESTAURANT": "מסעדות",
    "SPA": "ספא",
    "ATTRACTIONS": "אטרקציות",
    "CLOTHING": "ביגוד",
    "BOWLING": "באולינג",
    "OTHER": "אחר",
    "ALL": "הכל"
};

export const getHebrewCategory = (category: string | CouponCategory): string => {
    return categoryHebrew[category.toString()] || category.toString();
};