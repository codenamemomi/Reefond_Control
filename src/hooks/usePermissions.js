import { useMemo } from 'react';
import { hasPermission, hasRole, ROLE_PERMISSIONS } from '../api/permissions';

/**
 * Custom hook for permission and role checks
 */
export const usePermissions = () => {
    // Get user from localStorage
    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch {
            return {};
        }
    }, []);

    const role = user.role;

    /**
     * Check if current user has a specific permission
     * @param {string} permission 
     * @returns {boolean}
     */
    const can = (permission) => hasPermission(role, permission);

    /**
     * Check if current user has one of the specified roles
     * @param {string[]} roles 
     * @returns {boolean}
     */
    const is = (roles) => hasRole(role, Array.isArray(roles) ? roles : [roles]);

    return {
        can,
        is,
        role,
        user,
        permissions: role ? ROLE_PERMISSIONS[role.toUpperCase()] : []
    };
};
