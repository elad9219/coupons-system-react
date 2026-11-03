import { Notyf } from "notyf";
import "notyf/notyf.min.css";
import "./notifications.css";

class Notify {
    private notification = new Notyf({
        duration: 4000,
        ripple: false,
        dismissible: true,
        position: { x: "center", y: "bottom" },
        types: [
            {
                type: "success",
                background: "#FFFFFF",
                className: "app-toast app-toast--success",
                icon: {
                    className: "notyf__icon--success",
                    color: "#159B75"
                }
            },
            {
                type: "error",
                background: "#FFFFFF",
                className: "app-toast app-toast--error",
                icon: {
                    className: "notyf__icon--error",
                    color: "#DC4658"
                }
            },
            {
                type: "info",
                background: "#FFFFFF",
                className: "app-toast app-toast--info",
                icon: false
            }
        ]
    });

    private asText(message: string): string {
        const element = document.createElement("span");
        element.textContent = message;
        return element.innerHTML;
    }

    public success(message: string): void {
        this.notification.success(this.asText(message));
    }

    public error(message: string): void {
        this.notification.error(this.asText(message));
    }

    public info(message: string): void {
        this.notification.open({
            type: "info",
            message: this.asText(message)
        });
    }
}

const notify = new Notify();
export default notify;