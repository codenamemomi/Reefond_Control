export const UserRole = {
    ADMIN: "ADMIN",
    COMPLIANCE_OFFICER: "COMPLIANCE_OFFICER",
    ACCOUNTANT: "ACCOUNTANT",
    DEVELOPER: "DEVELOPER",
    VIEWER: "VIEWER",
};

export const UserPermission = {
    // Filing permissions
    VIEW_FILINGS: "view_filings",
    CREATE_FILING: "create_filing",
    UPDATE_FILING: "update_filing",
    SUBMIT_FILING: "submit_filing",
    MANAGE_FILINGS: "manage_filings",

    // Refund permissions
    VIEW_REFUND_CASES: "view_refund_cases",
    CREATE_REFUND_CASE: "create_refund_case",
    MANAGE_REFUND_CASES: "manage_refund_cases",

    // Taxpayer permissions
    VIEW_TAXPAYERS: "view_taxpayers",
    MANAGE_TAXPAYERS: "manage_taxpayers",

    // Organization/User management
    MANAGE_USERS: "manage_users",
    MANAGE_ORG_SETTINGS: "manage_org_settings",
    UPGRADE_PLAN: "upgrade_plan",

    // Dashboard/Reports
    VIEW_DASHBOARD: "view_dashboard",
    VIEW_REPORTS: "view_reports",

    // Technical/Developer
    MANAGE_API_KEYS: "manage_api_keys",
    VIEW_API_LOGS: "view_api_logs",
    USE_SANDBOX: "use_sandbox",
    CONFIGURE_WEBHOOKS: "configure_webhooks",

    // General
    UPLOAD_DOCUMENTS: "upload_documents",
};

export const ROLE_PERMISSIONS = {
    [UserRole.ADMIN]: Object.values(UserPermission),
    [UserRole.COMPLIANCE_OFFICER]: [
        UserPermission.VIEW_FILINGS,
        UserPermission.CREATE_FILING,
        UserPermission.UPDATE_FILING,
        UserPermission.SUBMIT_FILING,
        UserPermission.MANAGE_FILINGS,
        UserPermission.VIEW_REFUND_CASES,
        UserPermission.CREATE_REFUND_CASE,
        UserPermission.MANAGE_REFUND_CASES,
        UserPermission.VIEW_TAXPAYERS,
        UserPermission.VIEW_DASHBOARD,
        UserPermission.VIEW_REPORTS,
        UserPermission.UPLOAD_DOCUMENTS,
    ],
    [UserRole.ACCOUNTANT]: [
        UserPermission.VIEW_FILINGS,
        UserPermission.CREATE_FILING,
        UserPermission.UPDATE_FILING,
        UserPermission.VIEW_REFUND_CASES,
        UserPermission.VIEW_TAXPAYERS,
        UserPermission.MANAGE_TAXPAYERS,
        UserPermission.UPLOAD_DOCUMENTS,
    ],
    [UserRole.VIEWER]: [
        UserPermission.VIEW_FILINGS,
        UserPermission.VIEW_REFUND_CASES,
        UserPermission.VIEW_TAXPAYERS,
        UserPermission.VIEW_DASHBOARD,
        UserPermission.VIEW_REPORTS,
    ],
    [UserRole.DEVELOPER]: [
        UserPermission.MANAGE_API_KEYS,
        UserPermission.VIEW_API_LOGS,
        UserPermission.USE_SANDBOX,
        UserPermission.CONFIGURE_WEBHOOKS,
    ],
};

/**
 * Check if a role has a specific permission
 * @param {string} role 
 * @param {string} permission 
 * @returns {boolean}
 */
export const hasPermission = (role, permission) => {
    if (!role) return false;
    const permissions = ROLE_PERMISSIONS[role.toUpperCase()];
    if (!permissions) return false;
    return permissions.includes(permission);
};

/**
 * Check if a role is one of the target roles
 * @param {string} userRole 
 * @param {string[]} targetRoles 
 * @returns {boolean}
 */
export const hasRole = (userRole, targetRoles) => {
    if (!userRole) return false;
    return targetRoles.includes(userRole.toUpperCase());
};
