import apiClient from './auth';

export const filingService = {
    getFilings: async (params = {}) => {
        const { page = 1, size = 20, search = '', status = '', tax_type = '', state = '' } = params;
        let url = `/filings/?page=${page}&size=${size}`;

        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (status) url += `&status=${status}`;
        if (tax_type) url += `&tax_type=${tax_type}`;
        if (state) url += `&state=${state}`;

        const response = await apiClient.get(url);
        return response.data;
    },

    getFilingById: async (id) => {
        const response = await apiClient.get(`/filings/${id}`);
        return response.data;
    },

    getFilingStats: async (params = {}) => {
        let url = '/filings/stats/summary/';
        const queryParams = new URLSearchParams();
        if (params.taxpayer_id) queryParams.append('taxpayer_id', params.taxpayer_id);
        if (params.organization_id) queryParams.append('organization_id', params.organization_id);

        const queryString = queryParams.toString();
        if (queryString) url += `?${queryString}`;

        const response = await apiClient.get(url);
        return response.data;
    },

    createFiling: async (data) => {
        const response = await apiClient.post('/filings/', data);
        return response.data;
    },

    verifyFiling: async (id, data) => {
        const response = await apiClient.post(`/filings/${id}/verify/`, data);
        return response.data;
    }
};
