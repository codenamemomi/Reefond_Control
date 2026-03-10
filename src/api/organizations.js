import apiClient from './auth';

export const organizationService = {
    getOrganizations: async (skip = 0, limit = 100) => {
        const response = await apiClient.get(`/organizations/?skip=${skip}&limit=${limit}`);
        return response.data;
    },

    getOrganization: async (id) => {
        const response = await apiClient.get(`/organizations/${id}`);
        return response.data;
    },

    createOrganization: async (data) => {
        const response = await apiClient.post('/organizations/', data);
        return response.data;
    },

    updateOrganization: async (id, data) => {
        const response = await apiClient.put(`/organizations/${id}`, data);
        return response.data;
    },

    deleteOrganization: async (id) => {
        const response = await apiClient.delete(`/organizations/${id}`);
        return response.data;
    },

    getOrganizationStats: async (id) => {
        const response = await apiClient.get(`/organizations/stats/summary?organization_id=${id}`);
        return response.data;
    },

    getOrganizationSettings: async (id) => {
        const response = await apiClient.get(`/organizations/${id}/settings`);
        return response.data;
    },

    updateOrganizationSettings: async (id, data) => {
        const response = await apiClient.put(`/organizations/${id}/settings`, data);
        return response.data;
    },

    getOrganizationUsers: async (id) => {
        const response = await apiClient.get(`/organizations/${id}/users`);
        return response.data;
    },

    removeUserFromOrganization: async (orgId, userId) => {
        const response = await apiClient.post(`/organizations/${orgId}/users/${userId}/remove`);
        return response.data;
    },

    getOrganizationInvitations: async (id) => {
        const response = await apiClient.get(`/organizations/${id}/invitations`);
        return response.data;
    },

    createInvitation: async (orgId, data) => {
        const response = await apiClient.post(`/organizations/${orgId}/invitations`, data);
        return response.data;
    }
};
