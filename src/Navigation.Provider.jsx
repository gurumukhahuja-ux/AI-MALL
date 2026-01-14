import React, { useState } from 'react';
import { Routes, Route, Outlet, Navigate, BrowserRouter, Link } from 'react-router';
import { Toaster } from 'react-hot-toast';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerificationForm from './pages/VerificationForm';
import Chat from './pages/Chat';
import Sidebar from './Components/SideBar/Sidebar.jsx';
import Marketplace from "./marketplace/Marketplace";
import MyAgents from './my-agent/MyAgents';
import DashboardOverview from './pages/DashboardOverview';
import Automations from './pages/Automations';
import Admin from './admin/Admin';
// Vendor Auth imports removed
import Invoices from './pages/Invoices';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Series from './pages/Series';

import { AppRoute } from './types';
import { Menu } from 'lucide-react';
import AiBiz from './agents/AIBIZ/AiBiz.jsx';
import AiBase from './agents/AIBASE/AiBase.jsx';
import ComingSoon from './Components/ComingSoon/ComingSoon.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

import { lazy, Suspense } from 'react';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute.jsx';


// Vendor Imports
import VendorLayout from './Components/Vendor/VendorLayout';
import VendorOverview from './pages/Vendor/VendorOverview';
import VendorApps from './pages/Vendor/VendorApps';
import VendorRevenue from './pages/Vendor/VendorRevenue';
import VendorSettings from './pages/Vendor/VendorSettings';
// import VendorCommunication from './pages/Vendor/VendorCommunication'; // Removed in favor of split support
import VendorUserSupport from './pages/Vendor/VendorUserSupport';
import VendorAdminSupport from './pages/Vendor/VendorAdminSupport';
import VendorAppDetail from './pages/Vendor/VendorAppDetail';
import VendorTransactions from './pages/Vendor/VendorTransactions';

const LiveDemoPage = lazy(() => import('./pages/LiveDemoPage'));
const SecurityAndGuidelines = lazy(() => import('./pages/SecurityAndGuidelines'));
const TransactionHistory = lazy(() => import('./Components/Admin/TransactionHistory'));



const AuthenticatRoute = ({ children }) => {
  return children;
}

// ------------------------------
// Dashboard Layout (Auth pages)
// ------------------------------

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const user = JSON.parse(
    localStorage.getItem('user') || '{"name":"User"}'
  );

  return (
    <div className="fixed inset-0 flex bg-transparent text-slate-900 overflow-hidden font-sans h-[100dvh]">
      {/* Background Dreamy Orbs */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#f8fafc] via-[#eef2ff] to-[#fce7f3]">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/30 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/30 blur-[120px]"></div>
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-pink-200/20 blur-[100px]"></div>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 bg-transparent h-full relative overflow-hidden">

        {/* Mobile Header - Glassy & Refined */}
        <div className="md:hidden flex items-center justify-between p-6 bg-white/40 backdrop-blur-md border-b border-white/60 shrink-0 z-50 shadow-glass">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-surface text-maintext active:bg-surface/80 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-lg text-primary uppercase tracking-tighter">AI MALL</span>
          </div>

          <Link
            to={AppRoute.PROFILE}
            className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm uppercase hover:bg-primary/30 transition-colors"
          >
            {user.name?.charAt(0) || 'U'}
          </Link>
        </div>

        {/* Outlet for pages */}
        <main className="flex-1 overflow-auto relative w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// ------------------------------
// Placeholder Page
// ------------------------------

const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center h-full text-subtext flex-col">
    <h2 className="text-2xl font-bold mb-2 text-maintext">{title}</h2>
    <p>Coming soon...</p>
  </div>
);

// ------------------------------
// App Router
// ------------------------------

const NavigateProvider = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route path={AppRoute.LANDING} element={<Landing />} />
        <Route path={AppRoute.LOGIN} element={<Login />} />
        <Route path={AppRoute.SIGNUP} element={<Signup />} />
        <Route path={AppRoute.SERIES} element={<Series />} />
// Vendor Register/Login routes removed per request
        <Route path={AppRoute.E_Verification} element={<VerificationForm />} />
        <Route path={AppRoute.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={AppRoute.RESET_PASSWORD} element={<ResetPassword />} />
        <Route path="/agentsoon" element={<ComingSoon />}></Route>
        {/* agents */}
        <Route path='/agents/aibiz' element={<AiBiz />}></Route>
        <Route path='/agents/aibase/*' element={<AiBase />}></Route>
        {/* Dashboard (Protected) */}
        <Route
          path={AppRoute.DASHBOARD}
          element={<DashboardLayout />}
        >
          <Route index element={<Navigate to="marketplace" replace />} />
          <Route path="chat" element={<Chat />} />
          <Route path="chat/:sessionId" element={<Chat />} />
          <Route path="overview" element={<ProtectedRoute><DashboardOverview /></ProtectedRoute>} />
          <Route path="marketplace" element={<Marketplace />} />
          {/* <Route path="live-demos" element={
            <Suspense fallback={<div className="flex items-center justify-center h-full"><p className="text-subtext">Loading...</p></div>}>
              <LiveDemoPage />
            </Suspense>
          } /> */}
          <Route path="agents" element={<ProtectedRoute><MyAgents /></ProtectedRoute>} />
          <Route path="automations" element={<ProtectedRoute><Automations /></ProtectedRoute>} />
          <Route path="admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
          <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path="security" element={
            <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
              <SecurityAndGuidelines />
            </Suspense>
          } />
        </Route>


        {/* Vendor Dashboard Routes (Public for MVP/Testing) */}
        <Route path="/vendor" element={<VendorLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<VendorOverview />} />
          <Route path="apps" element={<VendorApps />} />
          <Route path="apps/:appId" element={<VendorAppDetail />} />
          <Route path="revenue" element={<VendorRevenue />} />
          <Route path="settings" element={<VendorSettings />} />
          <Route path="user-support" element={<VendorUserSupport />} />
          <Route path="admin-support" element={<VendorAdminSupport />} />
        </Route>

        {/* Catch All */}
        <Route path="*" element={<Navigate to={AppRoute.LANDING} replace />} />
      </Routes>
    </BrowserRouter >
  );
};

export default NavigateProvider;