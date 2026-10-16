import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BloodBags from './pages/BloodBags';
import BloodBagDetail from './pages/BloodBagDetail';
import ScanQR from './pages/ScanQR';
import Demands from './pages/Demands';
import Transfers from './pages/Transfers';
import Temperature from './pages/Temperature';
import AuditLogPage from './pages/AuditLog';
import Institutions from './pages/Institutions';
import UsersPage from './pages/Users';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { UserRole } from './types';

// Protected route wrapper - requires authentication
function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

// Role-based route guard
function RoleGuard({ roles }: { roles: UserRole[] }) {
  const { hasRole } = useAuth();
  if (!hasRole(...roles)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        {/* Dashboard - all authenticated users */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/blood-bags" element={<BloodBags />} />
        <Route path="/blood-bags/:code" element={<BloodBagDetail />} />
        <Route path="/scan" element={<ScanQR />} />

        {/* Routes for HEMOCENTRO, HOSPITAL, ADMIN */}
        <Route element={<RoleGuard roles={['ADMIN', 'HEMOCENTRO', 'HOSPITAL']} />}>
          <Route path="/demands" element={<Demands />} />
          <Route path="/transfers" element={<Transfers />} />
          <Route path="/temperature" element={<Temperature />} />
        </Route>

        {/* Routes for ADMIN and AUDITOR */}
        <Route element={<RoleGuard roles={['ADMIN', 'AUDITOR']} />}>
          <Route path="/audit" element={<AuditLogPage />} />
        </Route>

        {/* Routes for ADMIN only */}
        <Route element={<RoleGuard roles={['ADMIN']} />}>
          <Route path="/institutions" element={<Institutions />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}
