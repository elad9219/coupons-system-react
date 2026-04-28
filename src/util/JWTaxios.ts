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

// Response interceptor with an advanced Retry Mechanism
jwtAxios.interceptors.response.use(
    async (response) => {
        // Detect if the free server is waking up and returning an HTML loading page instead of JSON
        if (typeof response.data === 'string' && response.data.toLowerCase().includes('<html')) {
            const originalRequest = response.config as any;
            
            if (!originalRequest._retryCount) {
                originalRequest._retryCount = 0;
            }
            
            // Retry up to 10 times (approx 30 seconds total waiting)
            if (originalRequest._retryCount < 10) {
                originalRequest._retryCount += 1;
                window.dispatchEvent(new Event('serverWakingUp'));
                await new Promise(resolve => setTimeout(resolve, 3000));
                return jwtAxios(originalRequest);
            }
            return Promise.reject(new Error("Server timeout"));
        }

        // Valid JSON response received, server is fully awake
        window.dispatchEvent(new Event('serverAwake'));
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // If config is completely lost, reject normally
        if (!originalRequest) {
            return Promise.reject(error);
        }

        if (!originalRequest._retryCount) {
            originalRequest._retryCount = 0;
        }

        // Identify standard cold start errors: 502, 503, 504, or Network Error (missing CORS)
        const isColdStartError = !error.response || error.response.status >= 500;

        if (isColdStartError && originalRequest._retryCount < 10) {
            originalRequest._retryCount += 1;
            window.dispatchEvent(new Event('serverWakingUp'));
            await new Promise(resolve => setTimeout(resolve, 3000));
            return jwtAxios(originalRequest);
        }

        // Standard operational error (e.g., 401 Unauthorized, 404 Not Found)
        return Promise.reject(error);
    }
);

export default jwtAxios;