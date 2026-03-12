import apiClient from './auth';

export const reportsService = {
    // Filing reports
    getFilingStats: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);
        if (params.taxpayer_id) queryParams.append('taxpayer_id', params.taxpayer_id);
        const response = await apiClient.get(`/filings/stats/summary/?${queryParams.toString()}`);
        return response.data;
    },

    // Refund reports
    getRefundStats: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);
        if (params.taxpayer_id) queryParams.append('taxpayer_id', params.taxpayer_id);
        const response = await apiClient.get(`/refunds/stats/summary/?${queryParams.toString()}`);
        return response.data;
    },

    // Compliance report (risk assessment)
    getComplianceRiskReport: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.risk_level) queryParams.append('risk_level', params.risk_level);
        const response = await apiClient.get(`/compliance/reports/risk-assessment?${queryParams.toString()}`);
        return response.data;
    },

    // Compliance stats
    getComplianceStats: async () => {
        const response = await apiClient.get('/compliance/stats/summary/');
        return response.data;
    },

    // Compliance dashboard (overall score + distribution)
    getComplianceDashboard: async () => {
        const response = await apiClient.get('/compliance/dashboard/');
        return response.data;
    },

    // Refund dashboard metrics
    getRefundDashboardMetrics: async (daysBack = 90) => {
        const response = await apiClient.get(`/refunds/dashboard/metrics?days_back=${daysBack}`);
        return response.data;
    },

    // Organization stats (for org-level summaries)
    getOrganizationStats: async () => {
        const response = await apiClient.get('/organizations/stats/summary');
        return response.data;
    },

    // Calendar events for scheduled report
    getFilingCalendarEvents: async (startDate, endDate) => {
        const queryParams = new URLSearchParams();
        if (startDate) queryParams.append('start_date', startDate);
        if (endDate) queryParams.append('end_date', endDate);
        const response = await apiClient.get(`/filings/calendar/events/?${queryParams.toString()}`);
        return response.data;
    },
};
