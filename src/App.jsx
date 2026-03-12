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
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="logs" element={<Logs />} />
          <Route path="billing" element={<Billing />} />
          <Route path="usage" element={<Usage />} />
          <Route path="taxpayers" element={<Taxpayers />} />
          <Route path="taxpayers/:id" element={<TaxpayerDetails />} />
          <Route path="filings" element={<Filings />} />
          <Route path="refunds" element={<RefundCases />} />
          <Route path="compliance" element={<Compliance />} />
          <Route path="reports" element={<Reports />} />
          <Route path="vault" element={<DocumentVault />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
