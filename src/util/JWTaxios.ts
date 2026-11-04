import axios, { AxiosRequestConfig } from "axios";
import { store } from "../redux/store";
import {
    updateToken,
    userLogout
} from "../redux/authState";
import {
    clearStoredSession,
    getSessionClaims,
    getValidStoredToken
} from "./session";

interface RetryableRequestConfig extends AxiosRequestConfig {
    _retryDeadline?: number;
}

const RETRY_WINDOW_MS = 120000;
const RETRY_DELAY_MS = 3000;

const jwtAxios = axios.create({
    timeout: 20000
});

const sleep = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

const isSafeRead = (config: AxiosRequestConfig): boolean => {
    const method = (config.method || "get").toLowerCase();

    return method === "get" ||
        method === "head" ||
        method === "options";
};

const canRetry = (config: RetryableRequestConfig): boolean => {
    return isSafeRead(config) &&
        config.signal?.aborted !== true &&
        typeof config._retryDeadline === "number" &&
        Date.now() < config._retryDeadline;
};

const isInvalidCatalogResponse = (
    config: AxiosRequestConfig,
    data: unknown
): boolean => {
    if (
        !isSafeRead(config) ||
        !config.url?.split("?")[0].endsWith("/api/guest/catalog")
    ) {
        return false;
    }

    if (
        data === null ||
        typeof data !== "object" ||
        Array.isArray(data)
    ) {
        return true;
    }

    const catalog = data as Record<string, unknown>;

    return !Array.isArray(catalog.content) ||
        !Number.isInteger(catalog.page) ||
        !Number.isInteger(catalog.totalPages) ||
        !Number.isInteger(catalog.totalElements) ||
        (catalog.totalPages as number) < 0 ||
        (catalog.totalElements as number) < 0;
};

const isLoginRequest = (
    config: AxiosRequestConfig
): boolean => {
    return config.url?.endsWith("/api/login") === true;
};

const retryRequest = async (
    config: RetryableRequestConfig,
    failure: unknown
) => {
    window.dispatchEvent(new Event("serverWakingUp"));

    const remaining =
        (config._retryDeadline || 0) - Date.now();

    await sleep(
        Math.min(RETRY_DELAY_MS, Math.max(remaining, 0))
    );

    if (!canRetry(config)) {
        return Promise.reject(failure);
    }

    return jwtAxios(config);
};

jwtAxios.interceptors.request.use(request => {
    const retryConfig = request as RetryableRequestConfig;

    if (isSafeRead(retryConfig)) {
        if (retryConfig._retryDeadline === undefined) {
            retryConfig._retryDeadline =
                Date.now() + RETRY_WINDOW_MS;
        }

        const remaining = Math.max(
            1,
            retryConfig._retryDeadline - Date.now()
        );

        retryConfig.timeout = Math.min(
            retryConfig.timeout || 20000,
            remaining
        );
    }

    const previousToken = sessionStorage.getItem("token");
    const token = getValidStoredToken();

    if (
        previousToken &&
        !token &&
        store.getState().authState.userToken
    ) {
        store.dispatch(userLogout());
    }

    if (token) {
        request.headers = request.headers || {};
        request.headers.Authorization = token;
    } else if (request.headers) {
        delete request.headers.Authorization;
    }

    return request;
});

jwtAxios.interceptors.response.use(
    async response => {
        const isUnexpectedHtml =
            typeof response.data === "string" &&
            /^\s*<!doctype html|^\s*<html/i.test(response.data);

        const isInvalidCatalog = isInvalidCatalogResponse(
            response.config,
            response.data
        );

        if (isUnexpectedHtml || isInvalidCatalog) {
            const config =
                response.config as RetryableRequestConfig;

            const failure = new Error(
                isUnexpectedHtml
                    ? "Unexpected HTML response from API"
                    : "Invalid catalog response"
            );

            if (canRetry(config)) {
                return retryRequest(config, failure);
            }

            return Promise.reject(failure);
        }

        const refreshedToken =
            response.headers?.authorization ||
            response.headers?.Authorization;

        const submittedToken =
            response.config.headers?.Authorization;

        const currentToken = sessionStorage.getItem("token");

        const isCurrentSession =
            typeof submittedToken === "string" &&
            submittedToken === currentToken;

        // Login handles its own token validation and profile loading.
        // Do not update Redux before that process completes.
        if (
            !isLoginRequest(response.config) &&
            isCurrentSession &&
            typeof refreshedToken === "string" &&
            getSessionClaims(refreshedToken)
        ) {
            sessionStorage.setItem("token", refreshedToken);
            store.dispatch(updateToken(refreshedToken));
        }

        window.dispatchEvent(new Event("serverAwake"));

        return response;
    },
    async error => {
        const config = error.config as
            RetryableRequestConfig | undefined;

        const status = error.response?.status;

        const isNetworkFailure =
            (error.code === "ERR_NETWORK" || !error.response) &&
            !axios.isCancel(error);

        const isTemporaryServerFailure =
            status === 502 ||
            status === 503 ||
            status === 504;

        if (
            config &&
            canRetry(config) &&
            (isNetworkFailure || isTemporaryServerFailure)
        ) {
            return retryRequest(config, error);
        }

        // An authenticated request was rejected because its token
        // is invalid or has expired. Do not leave a stale login visible.
        if (
            status === 401 &&
            config &&
            !isLoginRequest(config)
        ) {
            const submittedToken =
                config.headers?.Authorization;

            const currentToken =
                sessionStorage.getItem("token");

            if (
                typeof submittedToken === "string" &&
                submittedToken === currentToken
            ) {
                clearStoredSession();
                store.dispatch(userLogout());

                window.dispatchEvent(
                    new Event("sessionExpired")
                );
            }
        }

        return Promise.reject(error);
    }
);

export default jwtAxios;