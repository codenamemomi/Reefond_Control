import apiClient from './auth';

export const dashboardService = {
    getOverviewStats: async () => {
        const response = await apiClient.get('/organizations/stats/summary');
        return response.data;
    },

    getComplianceDashboard: async () => {
        const response = await apiClient.get('/compliance/dashboard/');
        return response.data;
    },

    getRefundMetrics: async (daysBack = 30) => {
        const response = await apiClient.get(`/refunds/dashboard/metrics?days_back=${daysBack}`);
        return response.data;
    },

    getUpcomingRefunds: async () => {
        const response = await apiClient.get('/refunds/upcoming/overdue');
        return response.data;
    },

    getUpcomingFilings: async () => {
        const response = await apiClient.get('/filings/upcoming/overdue');
        return response.data;
    },

    getFilingStats: async () => {
        const response = await apiClient.get('/filings/stats/summary/');
        return response.data;
    },

    getCalendarEvents: async (startDate, endDate) => {
        const params = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        const response = await apiClient.get('/filings/calendar/events/', { params });
        return response.data;
    },

    getRecentActivities: async (limit = 10) => {
        const response = await apiClient.get('/organizations/activities', { params: { limit } });
        return response.data;
    },

    getComplianceAlerts: async () => {
        const response = await apiClient.get('/compliance/alerts?is_resolved=false&limit=5');
        return response.data;
    }
};
