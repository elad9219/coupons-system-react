import axios from "axios";

const jwtAxios = axios.create();

// Add token to every request
jwtAxios.interceptors.request.use(request => {
    // Changed to sessionStorage
    const token = sessionStorage.getItem('token');
    if (token) {
        request.headers.Authorization = token;
    }
    return request;
});

// Response interceptor with an advanced Retry Mechanism for CORS & Cold Starts
jwtAxios.interceptors.response.use(
    async (response) => {
        if (typeof response.data === 'string' && response.data.toLowerCase().includes('<html')) {
            const config = { ...response.config } as any;
            config._retryCount = (config._retryCount || 0) + 1;
            
            if (config._retryCount <= 10) {
                window.dispatchEvent(new Event('serverWakingUp'));
                await new Promise(resolve => setTimeout(resolve, 3000));
                return jwtAxios(config);
            }
            return Promise.reject(new Error("Server timeout"));
        }

        window.dispatchEvent(new Event('serverAwake'));
        return response;
    },
    async (error) => {
        const isCorsOrNetworkError = 
            !error.response || 
            error.message === 'Network Error' || 
            error.code === 'ERR_NETWORK' ||
            error.response.status >= 500;

        if (isCorsOrNetworkError && error.config) {
            const config = { ...error.config } as any;
            config._retryCount = (config._retryCount || 0) + 1;

            if (config._retryCount <= 10) {
                window.dispatchEvent(new Event('serverWakingUp'));
                await new Promise(resolve => setTimeout(resolve, 3000));
                return jwtAxios(config);
            }
        }

        return Promise.reject(error);
    }
);

export default jwtAxios;