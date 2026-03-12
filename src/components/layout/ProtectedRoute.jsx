import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../api/auth';
import { Loader2 } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';

const ProtectedRoute = ({ children, requiredPermission }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { can } = usePermissions();
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Try to get user profile to verify token/cookie
                await authService.getCurrentUser();
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Auth check failed:', error);
                setIsAuthenticated(false);
                // Also clear local storage if auth fails
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [location.pathname]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-ree-green animate-spin" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Verifying Access...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredPermission && !can(requiredPermission)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
