import { AxiosRequestConfig } from "axios";
import jwtAxios from "./JWTaxios";

const originalAdapter = jwtAxios.defaults.adapter;
const originalXMLHttpRequest = global.XMLHttpRequest;

const catalogUrl =
    "https://example.test/api/guest/catalog";

afterEach(() => {
    jwtAxios.defaults.adapter = originalAdapter;
    global.XMLHttpRequest = originalXMLHttpRequest;
    sessionStorage.clear();
});

test(
    "retries a browser network error from the real Axios XHR adapter",
    async () => {
        let attempts = 0;
        const wakingListener = jest.fn();

        class FakeXMLHttpRequest {
            status = 0;
            statusText = "";
            responseText = "";
            onerror: (() => void) | null = null;
            onloadend: (() => void) | null = null;

            open() {}
            setRequestHeader() {}

            getAllResponseHeaders() {
                return "content-type: application/json";
            }

            send() {
                attempts += 1;

                if (attempts === 1) {
                    this.onerror?.();
                    return;
                }

                this.status = 200;
                this.statusText = "OK";
                this.responseText = JSON.stringify({
                    content: [],
                    page: 0,
                    totalPages: 0,
                    totalElements: 0
                });
                this.onloadend?.();
            }
        }

        global.XMLHttpRequest =
            FakeXMLHttpRequest as unknown as typeof XMLHttpRequest;

        window.addEventListener("serverWakingUp", wakingListener);

        try {
            const response = await jwtAxios.get(catalogUrl);

            expect(attempts).toBe(2);
            expect(wakingListener).toHaveBeenCalledTimes(1);
            expect(response.data.content).toEqual([]);
        } finally {
            window.removeEventListener(
                "serverWakingUp",
                wakingListener
            );
        }
    },
    10000
);

test(
    "recovers from temporary catalog failures without manual refresh",
    async () => {
        let attempts = 0;

        const wakingListener = jest.fn();

        window.addEventListener(
            "serverWakingUp",
            wakingListener
        );

        jwtAxios.defaults.adapter = async (
            config: AxiosRequestConfig
        ) => {
            attempts += 1;

            if (attempts === 1) {
                throw Object.assign(
                    new Error("Service unavailable"),
                    {
                        config,
                        response: { status: 503 }
                    }
                );
            }

            if (attempts === 2) {
                throw Object.assign(
                    new Error("Network Error"),
                    { config }
                );
            }

            return {
                config,
                data: attempts === 3
                    ? { message: "Starting" }
                    : {
                        content: [],
                        page: 0,
                        totalPages: 0,
                        totalElements: 0
                    },
                status: 200,
                statusText: "OK",
                headers: {}
            };
        };

        try {
            const response = await jwtAxios.get(catalogUrl);

            expect(response.data.content).toEqual([]);
            expect(attempts).toBe(4);
            expect(wakingListener).toHaveBeenCalledTimes(3);
        } finally {
            window.removeEventListener(
                "serverWakingUp",
                wakingListener
            );
        }
    },
    20000
);

test("does not retry a failed POST", async () => {
    let attempts = 0;

    jwtAxios.defaults.adapter = async (
        config: AxiosRequestConfig
    ) => {
        attempts += 1;

        throw Object.assign(
            new Error("Service unavailable"),
            {
                config,
                response: { status: 503 }
            }
        );
    };

    await expect(
        jwtAxios.post("https://example.test/api/purchase")
    ).rejects.toThrow("Service unavailable");

    expect(attempts).toBe(1);
});