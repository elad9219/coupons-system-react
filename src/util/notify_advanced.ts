import notify from "./notify";

export enum SccMsg {
    LOGIN_APPROVED = "Hello my master",
    COMPANY_ADD = "A new company added successfully",
}

export enum ErrMsg {
    LOGIN_ERR = "Bad username or password",
    COMPANY_EXISTS = "There is a company with that email",
    CUSTOMER_EXISTS = "There is a customer with that email",
    COUPONS_ERR = "Problem to download coupons"
}

class Notify_Advanced {
    public success(message: string) {
        notify.success(message);
    }

    public error(err: any) {
        const msg = this.extractMsg(err);
        notify.error(msg);
    }

    private extractMsg(err: any): string {
        if (typeof err === "string") {
            return err;
        }

        if (typeof err?.response?.data === "string") {
            // Preserve the server-provided message.
            return err.response.data;
        }

        if (Array.isArray(err?.response?.data)) {
            // Preserve the server-provided message.
            return err.response.data[0];
        }

        // Handle standard Error objects after response data.
        if (typeof err?.message === "string") {
            return err.message;
        }

        return "לא הצלחנו להשלים את הפעולה. נסה שוב.";
    }
}

const advNotify = new Notify_Advanced();
export default advNotify;