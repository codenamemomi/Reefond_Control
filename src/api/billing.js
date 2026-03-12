import apiClient from './auth';

export const billingService = {
    getOrganizationBilling: async (orgId) => {
        const response = await apiClient.get(`/organizations/${orgId}/billing`);
        return response.data;
    },
    createCheckoutSession: async (planTier) => {
        const response = await apiClient.post('/payment/create-checkout-session', {
            plan_tier: planTier,
            success_url: window.location.origin + '/dashboard/billing?status=success',
            cancel_url: window.location.origin + '/dashboard/billing?status=cancelled'
        });
        return response.data;
    },
    verifyCheckoutSession: async (sessionId) => {
        const response = await apiClient.post('/payment/verify-session', {
            session_id: sessionId
        });
        return response.data;
    }
};
