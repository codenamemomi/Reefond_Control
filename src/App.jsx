import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DashboardLayout from './components/layout/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import Taxpayers from './pages/dashboard/Taxpayers';
import TaxpayerDetails from './pages/dashboard/TaxpayerDetails';
import Compliance from './pages/dashboard/Compliance';
import Filings from './pages/dashboard/Filings';
import RefundCases from './pages/dashboard/RefundCases';
import Settings from './pages/dashboard/Settings';
import Reports from './pages/dashboard/Reports';
import DocumentVault from './pages/dashboard/DocumentVault';
import Analytics from './pages/dashboard/Analytics';
import ProfileSettings from './pages/dashboard/ProfileSettings';
import Logs from './pages/dashboard/Logs';
import Billing from './pages/dashboard/Billing';
import Usage from './pages/dashboard/Usage';
import Pricing from './pages/Pricing';
import ProtectedRoute from './components/layout/ProtectedRoute';

import { UserPermission } from './api/permissions';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/pricing" element={
          <ProtectedRoute>
            <Pricing />
          </ProtectedRoute>
        } />

        {/* Dashboard Routes wrapper in Layout */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Overview />} />
          <Route path="settings" element={
            <ProtectedRoute requiredPermission={UserPermission.MANAGE_ORG_SETTINGS}>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="logs" element={
            <ProtectedRoute requiredPermission={UserPermission.VIEW_API_LOGS}>
              <Logs />
            </ProtectedRoute>
          } />
          <Route path="billing" element={
            <ProtectedRoute requiredPermission={UserPermission.UPGRADE_PLAN}>
              <Billing />
            </ProtectedRoute>
          } />
          <Route path="usage" element={
            <ProtectedRoute requiredPermission={UserPermission.UPGRADE_PLAN}>
              <Usage />
            </ProtectedRoute>
          } />
          <Route path="taxpayers" element={
            <ProtectedRoute requiredPermission={UserPermission.VIEW_TAXPAYERS}>
              <Taxpayers />
            </ProtectedRoute>
          } />
          <Route path="taxpayers/:id" element={
            <ProtectedRoute requiredPermission={UserPermission.VIEW_TAXPAYERS}>
              <TaxpayerDetails />
            </ProtectedRoute>
          } />
          <Route path="filings" element={
            <ProtectedRoute requiredPermission={UserPermission.VIEW_FILINGS}>
              <Filings />
            </ProtectedRoute>
          } />
          <Route path="refunds" element={
            <ProtectedRoute requiredPermission={UserPermission.VIEW_REFUND_CASES}>
              <RefundCases />
            </ProtectedRoute>
          } />
          <Route path="compliance" element={<Compliance />} />
          <Route path="reports" element={
            <ProtectedRoute requiredPermission={UserPermission.VIEW_REPORTS}>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="vault" element={
            <ProtectedRoute requiredPermission={UserPermission.VIEW_FILINGS}>
              <DocumentVault />
            </ProtectedRoute>
          } />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
