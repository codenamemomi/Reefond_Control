import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for cookies
});

// Request interceptor for adding auth token (as fallback/double-check)
apiClient.interceptors.request.use(
    (config) => {
        const token = Cookies.get('access_token') || localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const authService = {
    login: async (email, password) => {
        const response = await apiClient.post('/auth/login', { email, password });
        return response.data;
    },

    logout: () => {
        Cookies.remove('access_token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    forgotPassword: async (email) => {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token, newPassword) => {
        const response = await apiClient.post('/auth/reset-password', {
            token,
            new_password: newPassword,
        });
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await apiClient.put('/auth/me', data);
        return response.data;
    },

    changePassword: async (currentPassword, newPassword) => {
        const response = await apiClient.post('/auth/change-password', {
            current_password: currentPassword,
            new_password: newPassword
        });
        return response.data;
    }
};

export default apiClient;
