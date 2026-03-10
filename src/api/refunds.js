import apiClient from './auth';

export const refundService = {
    getRefunds: async (params = {}) => {
        const { page = 1, size = 20, search = '', status = '', priority = '' } = params;
        let url = `/refunds/?page=${page}&size=${size}`;

        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (status) url += `&status=${status}`;
        if (priority) url += `&priority=${priority}`;

        const response = await apiClient.get(url);
        return response.data;
    },

    getRefundById: async (id) => {
        const response = await apiClient.get(`/refunds/${id}`);
        return response.data;
    },

    getRefundStats: async (params = {}) => {
        let url = '/refunds/stats/summary/';
        const queryParams = new URLSearchParams();
        if (params.taxpayer_id) queryParams.append('taxpayer_id', params.taxpayer_id);
        if (params.organization_id) queryParams.append('organization_id', params.organization_id);

        const queryString = queryParams.toString();
        if (queryString) url += `?${queryString}`;

        const response = await apiClient.get(url);
        return response.data;
    },

    createRefund: async (data) => {
        const response = await apiClient.post('/refunds/', data);
        return response.data;
    },

    approveRefund: async (id, data) => {
        const response = await apiClient.post(`/refunds/${id}/approve/`, data);
        return response.data;
    }
};
