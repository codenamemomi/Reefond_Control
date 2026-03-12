import apiClient from './auth';

export const complianceService = {
    getRules: async (params = {}) => {
        const { is_active, rule_type, skip = 0, limit = 100 } = params;
        let url = `/compliance/rules?skip=${skip}&limit=${limit}`;
        if (is_active !== undefined) url += `&is_active=${is_active}`;
        if (rule_type) url += `&rule_type=${rule_type}`;

        const response = await apiClient.get(url);
        return response.data;
    },

    getTaxpayerScore: async (taxpayerId) => {
        const response = await apiClient.get(`/compliance/scores/${taxpayerId}`);
        return response.data;
    },

    calculateScore: async (taxpayerId, force = false) => {
        const response = await apiClient.post('/compliance/scores/calculate/', {
            taxpayer_id: taxpayerId,
            force_recalculation: force
        });
        return response.data;
    },

    getHistory: async (taxpayerId, limit = 12) => {
        const response = await apiClient.get(`/compliance/scores/${taxpayerId}/history?limit=${limit}`);
        return response.data;
    },

    getAlerts: async (params = {}) => {
        const { taxpayer_id, is_resolved = false, page = 1, size = 20 } = params;
        let url = `/compliance/alerts?is_resolved=${is_resolved}&skip=${(page - 1) * size}&limit=${size}`;
        if (taxpayer_id) url += `&taxpayer_id=${taxpayer_id}`;

        const response = await apiClient.get(url);
        return response.data;
    },

    resolveAlert: async (alertId, resolutionData) => {
        const response = await apiClient.post(`/compliance/alerts/${alertId}/resolve`, resolutionData);
        return response.data;
    },

    getStats: async (organizationId = null) => {
        let url = '/compliance/stats/summary/';
        if (organizationId) url += `?organization_id=${organizationId}`;
        const response = await apiClient.get(url);
        return response.data;
    },

    getDashboard: async (organizationId = null) => {
        let url = '/compliance/dashboard/';
        if (organizationId) url += `?organization_id=${organizationId}`;
        const response = await apiClient.get(url);
        return response.data;
    }
};
