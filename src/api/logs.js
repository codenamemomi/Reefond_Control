import apiClient from './auth';

export const logsService = {
    getAuditLogs: async (params = {}) => {
        // params could be { skip, limit, user_id, action, entity_type }
        const response = await apiClient.get('/admin/audit-logs', { params });
        return response.data;
    }
};
