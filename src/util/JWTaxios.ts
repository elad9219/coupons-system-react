import axios from "axios";

const jwtAxios = axios.create();

// Add token to every request
jwtAxios.interceptors.request.use(request => {
    const token = localStorage.getItem('token');
    if (token) {
        request.headers.Authorization = token;
    }
    return request;
});

// Response interceptor with a smart Retry Mechanism for cold starts
jwtAxios.interceptors.response.use(
    (response) => {
        // Success! If the UI was showing a "Waking up" message, tell it to stop.
        window.dispatchEvent(new Event('serverAwake'));
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Initialize retry counter
        if (!originalRequest._retryCount) {
            originalRequest._retryCount = 0;
        }

        // Check if the error is a cold start (Network Error or 502/503 from runmydocker)
        const isColdStartError = !error.response || error.response.status === 502 || error.response.status === 503;

        // If it's a cold start and we haven't retried 4 times yet, wait and try again
        if (isColdStartError && originalRequest._retryCount < 4) {
            originalRequest._retryCount += 1;

            // Dispatch a custom event so the LoadingSpinner knows to show the text
            window.dispatchEvent(new Event('serverWakingUp'));

            // Wait 3 seconds silently before retrying
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Retry the original request
            return jwtAxios(originalRequest);
        }

        // If it's a normal error (e.g., 401 Unauthorized) or we exceeded retries, throw normally
        return Promise.reject(error);
    }
);

export default jwtAxios;