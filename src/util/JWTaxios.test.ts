import { AxiosRequestConfig } from "axios";
import jwtAxios from "./JWTaxios";

const originalAdapter = jwtAxios.defaults.adapter;

const catalogUrl =
    "https://example.test/api/guest/catalog";

afterEach(() => {
    jwtAxios.defaults.adapter = originalAdapter;
    sessionStorage.clear();
});

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