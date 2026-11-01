
import jwt_decode from "jwt-decode";

export type SessionRole = "ADMIN" | "COMPANY" | "CUSTOMER";

export interface SessionClaims {
    userType: SessionRole;
    exp: number;
    userId?: number;
    sub?: string;
}

const VALID_ROLES: SessionRole[] = [
    "ADMIN",
    "COMPANY",
    "CUSTOMER"
];

export function getSessionClaims(
    token: string | null
): SessionClaims | null {
    if (
        !token ||
        !token.startsWith("Bearer ")
    ) {
        return null;
    }

    const rawToken = token.substring(7).trim();

    if (!rawToken) {
        return null;
    }

    try {
        const claims = jwt_decode<Partial<SessionClaims>>(rawToken);
        const now = Math.floor(Date.now() / 1000);

        if (
            !claims ||
            !VALID_ROLES.includes(claims.userType as SessionRole) ||
            typeof claims.exp !== "number" ||
            !Number.isFinite(claims.exp) ||
            claims.exp <= now
        ) {
            return null;
        }

        return claims as SessionClaims;
    } catch {
        return null;
    }
}

export function clearStoredSession(): void {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userId");
}

export function getValidStoredToken(): string | null {
    const token = sessionStorage.getItem("token");

    if (!token) {
        return null;
    }

    if (!getSessionClaims(token)) {
        clearStoredSession();
        return null;
    }

    return token;
}
