import axios, { AxiosRequestConfig } from "axios";
import { store } from "../redux/store";
import { updateToken } from "../redux/authState";

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
    const token = sessionStorage.getItem("token");

    if (token) {
        request.headers = request.headers || {};
        request.headers.Authorization = token;
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

        const currentToken =
            sessionStorage.getItem("token");

        const isLoginResponse =
            response.config.url?.endsWith("/api/login") === true;

        const isCurrentSession =
            typeof submittedToken === "string" &&
            submittedToken === currentToken;

        if (
            typeof refreshedToken === "string" &&
            refreshedToken.startsWith("Bearer ") &&
            (isLoginResponse || isCurrentSession)
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

        return Promise.reject(error);
    }
);

export default jwtAxios;