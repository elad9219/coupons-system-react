
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
    _retryCount?: number;
}

const MAX_RETRIES = 10;
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
        (config._retryCount || 0) < MAX_RETRIES;
};

const isLoginRequest = (
    config: AxiosRequestConfig
): boolean => {
    return config.url?.endsWith("/api/login") === true;
};

const retryRequest = async (
    config: RetryableRequestConfig
) => {
    window.dispatchEvent(new Event("serverWakingUp"));

    await sleep(RETRY_DELAY_MS);

    return jwtAxios({
        ...config,
        _retryCount: (config._retryCount || 0) + 1
    } as RetryableRequestConfig);
};

jwtAxios.interceptors.request.use(request => {
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

        if (isUnexpectedHtml) {
            const config = response.config as RetryableRequestConfig;

            if (canRetry(config)) {
                return retryRequest(config);
            }

            return Promise.reject(
                new Error("Unexpected HTML response from API")
            );
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
            !error.response &&
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
            return retryRequest(config);
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
