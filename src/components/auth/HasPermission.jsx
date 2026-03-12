import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

/**
 * Component to conditionally render children based on permissions
 * @param {Object} props
 * @param {string} props.permission - Required permission
 * @param {string[]} props.roles - Optional list of required roles
 * @param {React.ReactNode} props.children
 * @param {React.ReactNode} props.fallback - Optional fallback content
 */
const HasPermission = ({ permission, roles, children, fallback = null }) => {
    const { can, is } = usePermissions();

    const hasAccess = () => {
        if (permission && !can(permission)) return false;
        if (roles && !is(roles)) return false;
        return true;
    };

    if (!hasAccess()) {
        return fallback;
    }

    return <>{children}</>;
};

export default HasPermission;
