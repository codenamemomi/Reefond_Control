import apiClient from './auth';

export const filingService = {
    getFilings: async (params = {}) => {
        const { page = 1, size = 20, search = '', status = '', tax_type = '', state = '', taxpayer_id = '' } = params;
        let url = `/filings/?page=${page}&size=${size}`;

        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (status) url += `&status=${status}`;
        if (tax_type) url += `&tax_type=${tax_type}`;
        if (state) url += `&state=${state}`;
        if (taxpayer_id) url += `&taxpayer_id=${taxpayer_id}`;

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

    updateFiling: async (id, data) => {
        const response = await apiClient.put(`/filings/${id}`, data);
        return response.data;
    },

    submitFiling: async (id, data) => {
        const response = await apiClient.post(`/filings/${id}/submit/`, data);
        return response.data;
    },

    verifyFiling: async (id, data) => {
        const response = await apiClient.post(`/filings/${id}/verify/`, data);
        return response.data;
    },

    rejectFiling: async (id, data) => {
        const response = await apiClient.post(`/filings/${id}/reject/`, data);
        return response.data;
    },

    createAmendment: async (id, data) => {
        const response = await apiClient.post(`/filings/${id}/amendments/`, data);
        return response.data;
    },

    getAmendments: async (id) => {
        const response = await apiClient.get(`/filings/${id}/amendments/`);
        return response.data;
    },

    getAttachments: async (id) => {
        const response = await apiClient.get(`/filings/${id}/attachments/`);
        return response.data;
    },

    addAttachment: async (id, data) => {
        const response = await apiClient.post(`/filings/${id}/attachments/`, data);
        return response.data;
    },

    getCalendarEvents: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);

        const response = await apiClient.get(`/filings/calendar/events/?${queryParams.toString()}`);
        return response.data;
    }
};
