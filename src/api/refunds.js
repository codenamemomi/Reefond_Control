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

    getDashboardMetrics: async (daysBack = 30) => {
        const response = await apiClient.get(`/refunds/dashboard/metrics?days_back=${daysBack}`);
        return response.data;
    },

    createRefund: async (data) => {
        const response = await apiClient.post('/refunds/', data);
        return response.data;
    },

    updateRefund: async (id, data) => {
        const response = await apiClient.put(`/refunds/${id}`, data);
        return response.data;
    },

    submitToTaxOffice: async (id, data) => {
        const response = await apiClient.post(`/refunds/${id}/submit-to-tax-office/`, data);
        return response.data;
    },

    approveRefund: async (id, data) => {
        const response = await apiClient.post(`/refunds/${id}/approve/`, data);
        return response.data;
    },

    rejectRefund: async (id, data) => {
        const response = await apiClient.post(`/refunds/${id}/reject/`, data);
        return response.data;
    },

    disburseRefund: async (id, data) => {
        const response = await apiClient.post(`/refunds/${id}/disburse/`, data);
        return response.data;
    },

    appealRefund: async (id, data) => {
        const response = await apiClient.post(`/refunds/${id}/appeal/`, data);
        return response.data;
    },

    withdrawRefund: async (id, data) => {
        const response = await apiClient.post(`/refunds/${id}/withdraw/`, data);
        return response.data;
    },

    getRefundTimeline: async (id) => {
        const response = await apiClient.get(`/refunds/${id}/timeline/`);
        return response.data;
    },

    addRefundUpdate: async (id, data) => {
        const response = await apiClient.post(`/refunds/${id}/updates/`, data);
        return response.data;
    },

    getRefundUpdates: async (id) => {
        const response = await apiClient.get(`/refunds/${id}/updates/`);
        return response.data;
    },

    getRefundDocuments: async (id) => {
        const response = await apiClient.get(`/refunds/${id}/documents/`);
        return response.data;
    },

    addRefundDocument: async (id, data) => {
        const response = await apiClient.post(`/refunds/${id}/documents/`, data);
        return response.data;
    }
};
