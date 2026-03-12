import apiClient from './auth';

export const documentsService = {
    // Organization documents
    getOrgDocuments: async (orgId, params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.document_type) queryParams.append('document_type', params.document_type);
        if (params.is_verified !== undefined) queryParams.append('is_verified', params.is_verified);
        if (params.skip) queryParams.append('skip', params.skip);
        if (params.limit) queryParams.append('limit', params.limit);
        const response = await apiClient.get(`/organizations/${orgId}/documents?${queryParams.toString()}`);
        return response.data;
    },

    addOrgDocument: async (orgId, data) => {
        const response = await apiClient.post(`/organizations/${orgId}/documents`, data);
        return response.data;
    },

    verifyDocument: async (documentId, isVerified, notes = '') => {
        const queryParams = new URLSearchParams({ is_verified: isVerified });
        if (notes) queryParams.append('verification_notes', notes);
        const response = await apiClient.post(`/organizations/documents/${documentId}/verify?${queryParams.toString()}`);
        return response.data;
    },

    // Refund documents
    getRefundDocuments: async (refundId) => {
        const response = await apiClient.get(`/refunds/${refundId}/documents/`);
        return response.data;
    },

    addRefundDocument: async (refundId, data) => {
        const response = await apiClient.post(`/refunds/${refundId}/documents/`, data);
        return response.data;
    },

    // Filing attachments (documents attached to filings)
    getFilingAttachments: async (filingId) => {
        const response = await apiClient.get(`/filings/${filingId}/attachments/`);
        return response.data;
    },

    addFilingAttachment: async (filingId, data) => {
        const response = await apiClient.post(`/filings/${filingId}/attachments/`, data);
        return response.data;
    },

    deleteFilingAttachment: async (attachmentId) => {
        const response = await apiClient.delete(`/filings/attachments/${attachmentId}`);
        return response.data;
    },
};
