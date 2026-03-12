import apiClient from './auth';

export const analyticsService = {
    // Core filing analytics
    getFilingStats: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);
        const response = await apiClient.get(`/filings/stats/summary/?${queryParams.toString()}`);
        return response.data;
    },

    // Refund analytics
    getRefundStats: async () => {
        const response = await apiClient.get('/refunds/stats/summary/');
        return response.data;
    },

    // Refund dashboard metrics
    getRefundMetrics: async (daysBack = 90) => {
        const response = await apiClient.get(`/refunds/dashboard/metrics?days_back=${daysBack}`);
        return response.data;
    },

    // Compliance analytics
    getComplianceDashboard: async () => {
        const response = await apiClient.get('/compliance/dashboard/');
        return response.data;
    },

    getComplianceStats: async () => {
        const response = await apiClient.get('/compliance/stats/summary/');
        return response.data;
    },

    // Organization-level analytics
    getOrganizationStats: async () => {
        const response = await apiClient.get('/organizations/stats/summary');
        return response.data;
    },

    // Calendar events for trend over time
    getCalendarEvents: async (startDate, endDate) => {
        const queryParams = new URLSearchParams();
        if (startDate) queryParams.append('start_date', startDate);
        if (endDate) queryParams.append('end_date', endDate);
        const response = await apiClient.get(`/filings/calendar/events/?${queryParams.toString()}`);
        return response.data;
    },

    // Compliance risk report
    getComplianceRiskReport: async () => {
        const response = await apiClient.get('/compliance/reports/risk-assessment');
        return response.data;
    },
};
