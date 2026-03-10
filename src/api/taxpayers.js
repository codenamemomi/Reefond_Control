import apiClient from './auth';

export const taxpayerService = {
    getTaxpayers: async (params = {}) => {
        const { page = 1, size = 20, search = '', state = '', status = '', tax_type = '' } = params;
        let url = `/taxpayers/?page=${page}&size=${size}`;

        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (state) url += `&state=${encodeURIComponent(state)}`;
        if (status) url += `&status=${encodeURIComponent(status)}`;
        if (tax_type) url += `&tax_type=${encodeURIComponent(tax_type)}`;

        const response = await apiClient.get(url);
        return response.data;
    },

    getTaxpayerById: async (id) => {
        const response = await apiClient.get(`/taxpayers/${id}`);
        return response.data;
    },

    createTaxpayer: async (data) => {
        const response = await apiClient.post('/taxpayers/', data);
        return response.data;
    },

    updateTaxpayer: async (id, data) => {
        const response = await apiClient.put(`/taxpayers/${id}`, data);
        return response.data;
    },

    deleteTaxpayer: async (id, softDelete = true) => {
        const response = await apiClient.delete(`/taxpayers/${id}?soft_delete=${softDelete}`);
        return response.data;
    },

    getTaxpayerStats: async (organizationId = null) => {
        let url = '/taxpayers/stats/summary';
        if (organizationId) url += `?organization_id=${organizationId}`;
        const response = await apiClient.get(url);
        return response.data;
    },

    verifyTaxpayer: async (id) => {
        const response = await apiClient.post(`/taxpayers/${id}/verify`);
        return response.data;
    }
};
