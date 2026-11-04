
import {
    clearStoredSession,
    getSessionClaims,
    getValidStoredToken
} from "./session";

function createToken(
    userType: string,
    expiresInSeconds: number
): string {
    const payload = {
        userType,
        userId: 21,
        exp: Math.floor(Date.now() / 1000) + expiresInSeconds
    };

    const encoded = btoa(JSON.stringify(payload))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    return `Bearer header.${encoded}.signature`;
}

beforeEach(() => {
    sessionStorage.clear();
});

describe("Stored JWT session", () => {
    test("restores a valid customer token", () => {
        const token = createToken("CUSTOMER", 3600);

        sessionStorage.setItem("token", token);

        expect(getValidStoredToken()).toBe(token);
        expect(getSessionClaims(token)?.userType).toBe("CUSTOMER");
        expect(getSessionClaims(token)?.userId).toBe(21);
    });

    test("removes an expired token and identity", () => {
        sessionStorage.setItem(
            "token",
            createToken("CUSTOMER", -60)
        );
        sessionStorage.setItem("userName", "Kobi");
        sessionStorage.setItem("userId", "21");

        expect(getValidStoredToken()).toBeNull();
        expect(sessionStorage.getItem("token")).toBeNull();
        expect(sessionStorage.getItem("userName")).toBeNull();
        expect(sessionStorage.getItem("userId")).toBeNull();
    });

    test("rejects a malformed token", () => {
        sessionStorage.setItem(
            "token",
            "Bearer invalid-token"
        );

        expect(getValidStoredToken()).toBeNull();
        expect(sessionStorage.getItem("token")).toBeNull();
    });

    test("rejects an unsupported user role", () => {
        const token = createToken("SUPERUSER", 3600);

        expect(getSessionClaims(token)).toBeNull();
    });

    test("clears session without removing the last route", () => {
        sessionStorage.setItem("token", "example");
        sessionStorage.setItem("userName", "Example");
        sessionStorage.setItem("userId", "5");
        sessionStorage.setItem(
            "lastPath",
            "/company/allCoupons"
        );

        clearStoredSession();

        expect(sessionStorage.getItem("token")).toBeNull();
        expect(sessionStorage.getItem("userName")).toBeNull();
        expect(sessionStorage.getItem("userId")).toBeNull();
        expect(sessionStorage.getItem("lastPath"))
            .toBe("/company/allCoupons");
    });
});
