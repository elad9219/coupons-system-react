import axios from "axios";

export function getApiErrorMessage(
    error: unknown,
    fallback: string
): string {
    if (!axios.isAxiosError(error)) {
        return fallback;
    }

    const response = error.response;

    if (
        !response ||
        response.status === 502 ||
        response.status === 503 ||
        response.status === 504
    ) {
        return "השרת אינו זמין כרגע. המתן מעט ונסה שוב.";
    }

    if (response.status === 401 || response.status === 403) {
        return "אין הרשאה לבצע את הפעולה. נסה להתחבר מחדש.";
    }

    const data: unknown = response.data;
    let description: string | undefined;

    if (typeof data === "string") {
        description = data;
    } else if (
        data !== null &&
        typeof data === "object" &&
        !Array.isArray(data)
    ) {
        const details = data as Record<string, unknown>;

        if (typeof details.description === "string") {
            description = details.description;
        } else if (typeof details.message === "string") {
            description = details.message;
        }
    }

    if (!description) {
        return fallback;
    }

    if (
        /email/i.test(description) &&
        /already|exist|registered|taken/i.test(description)
    ) {
        return "כתובת האימייל כבר קיימת במערכת.";
    }

    if (/company.*already exists/i.test(description)) {
        return "שם החברה כבר קיים במערכת.";
    }

    if (/coupon.*already exists/i.test(description)) {
        return "קופון בשם הזה כבר קיים בחברה.";
    }

    const message = description.trim();

    if (
        !message ||
        message.length > 250 ||
        /^\s*</.test(message)
    ) {
        return fallback;
    }

    return message;
}
