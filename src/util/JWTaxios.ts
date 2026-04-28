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

// Response interceptor with an advanced Retry Mechanism for CORS & Cold Starts
jwtAxios.interceptors.response.use(
    async (response) => {
        // אם שרת חינמי מחזיר דף HTML במקום JSON בזמן התעוררות
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

        // התקבלה תשובה תקינה (השרת ער)
        window.dispatchEvent(new Event('serverAwake'));
        return response;
    },
    async (error) => {
        // זיהוי חסימת CORS מוחלטת או שגיאת רשת בגלל שרת כבוי
        const isCorsOrNetworkError = 
            !error.response || 
            error.message === 'Network Error' || 
            error.code === 'ERR_NETWORK' ||
            error.response.status >= 500;

        if (isCorsOrNetworkError && error.config) {
            // יצירת עותק נקי של הבקשה המקורית כדי שאקסיוס לא יאבד אותה
            const config = { ...error.config } as any;
            config._retryCount = (config._retryCount || 0) + 1;

            // נסה שוב עד 10 פעמים (כ-30 שניות המתנה)
            if (config._retryCount <= 10) {
                window.dispatchEvent(new Event('serverWakingUp'));
                await new Promise(resolve => setTimeout(resolve, 3000));
                return jwtAxios(config);
            }
        }

        // במקרה של שגיאה רגילה (למשל 401 או 404)
        return Promise.reject(error);
    }
);

export default jwtAxios;