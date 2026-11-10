
import React, { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import ProjectListPage from './pages/ProjectListPage';
import CreateEditProjectPage from './pages/CreateEditProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProposalBiddingPage from './pages/ProposalBiddingPage';
import BidComparisonPage from './pages/BidComparisonPage';
import ContractManagementPage from './pages/ContractManagementPage';
import MilestoneDeliverablesPage from './pages/MilestoneDeliverablesPage';
import PaymentManagementPage from './pages/PaymentManagementPage';
import ReportsPage from './pages/ReportsPage';
import NotFoundPage from './pages/NotFoundPage';

// Main application layout
function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  if (!user) {
    return children;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        onToggleSidebar={() => setSidebarOpen((previous) => !previous)}
      />

      <div className="flex flex-1">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// Application routes
function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />

          {/* Projects */}
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />

          {/* Create project: Client and Admin */}
          <Route element={<ProtectedRoute allowedRoles={['client', 'admin']} />}>
            <Route
              path="/projects/create"
              element={<CreateEditProjectPage />}
            />

            <Route
              path="/projects/:id/edit"
              element={<CreateEditProjectPage />}
            />

            <Route
              path="/projects/:projectId/compare"
              element={<BidComparisonPage />}
            />
          </Route>

          {/* Bids */}
          <Route path="/bids" element={<ProposalBiddingPage />} />

          {/* Contracts */}
          <Route
            path="/contracts"
            element={<ContractManagementPage />}
          />

          <Route
            path="/contracts/:id"
            element={<MilestoneDeliverablesPage />}
          />

          {/* Payments */}
          <Route
            path="/payments"
            element={<PaymentManagementPage />}
          />

          {/* Reports */}
          <Route
            path="/reports"
            element={<ReportsPage />}
          />

          {/* Admin only */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route
              path="/users"
              element={<UserManagementPage />}
            />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
