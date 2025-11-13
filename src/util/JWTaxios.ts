import axios from "axios";

const jwtAxios = axios.create();

jwtAxios.interceptors.request.use(request => {
    const token = localStorage.getItem('token');
    if (token) {
        request.headers.Authorization = token;
    }
    return request;
});

export default jwtAxios;