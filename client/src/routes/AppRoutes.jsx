import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import PassengerLayout from '../layouts/PassengerLayout';
import AdminLayout from '../layouts/AdminLayout';
import ConductorLayout from '../layouts/ConductorLayout';

// Public Pages
import LandingPage from '../pages/public/LandingPage';
import AdminLoginChoice from '../pages/public/AdminLoginChoice';
import AboutUs from '../pages/public/AboutUs';
import NotFound from '../pages/public/NotFound';

// Passenger Pages
import PassengerLogin from '../pages/passenger/PassengerLogin';
import PassengerRegister from '../pages/passenger/PassengerRegister';
import PassengerHome from '../pages/passenger/PassengerHome';
import TrainSelection from '../pages/passenger/TrainSelection';
import DestinationSelection from '../pages/passenger/DestinationSelection';
import RouteDetails from '../pages/passenger/RouteDetails';
import BookingPage from '../pages/passenger/BookingPage';
import PaymentPage from '../pages/passenger/PaymentPage';
import TicketPage from '../pages/passenger/TicketPage';
import PoolProgress from '../pages/passenger/PoolProgress';
import BookingHistory from '../pages/passenger/BookingHistory';
import PassengerProfile from '../pages/passenger/PassengerProfile';
import LiveTracking from '../pages/passenger/LiveTracking';
import MysoreHeatmap from '../pages/passenger/MysoreHeatmap';

// Admin Pages
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import PassengerManagement from '../pages/admin/PassengerManagement';
import TrainManagement from '../pages/admin/TrainManagement';
import TrainMonitoring from '../pages/admin/TrainMonitoring';
import BookingManagement from '../pages/admin/BookingManagement';
import PoolManagement from '../pages/admin/PoolManagement';
import DestinationManagement from '../pages/admin/DestinationManagement';
import RouteManagement from '../pages/admin/RouteManagement';
import VehicleManagement from '../pages/admin/VehicleManagement';
import DriverManagement from '../pages/admin/DriverManagement';
import DispatchManagement from '../pages/admin/DispatchManagement';
import PaymentManagement from '../pages/admin/PaymentManagement';
import TicketManagement from '../pages/admin/TicketManagement';
import DemandAnalytics from '../pages/admin/DemandAnalytics';
import Reports from '../pages/admin/Reports';
import AdminSettings from '../pages/admin/AdminSettings';

// Conductor Pages
import ConductorLogin from '../pages/conductor/ConductorLogin';
import ConductorDashboard from '../pages/conductor/ConductorDashboard';
import QRScanner from '../pages/conductor/QRScanner';
import ManualValidation from '../pages/conductor/ManualValidation';
import PassengerManifest from '../pages/conductor/PassengerManifest';

// Auth Protection Hooks
import { usePassengerAuth } from '../context/PassengerAuthContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useConductorAuth } from '../context/ConductorAuthContext';

function ProtectedPassengerRoute({ children }) {
  const { isAuthenticated, loading } = usePassengerAuth();
  if (loading) return <div className="p-8 text-center text-slate-400">Verifying passenger credentials...</div>;
  if (!isAuthenticated) return <Navigate to="/passenger/login" replace />;
  return children;
}

function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();
  if (loading) return <div className="p-8 text-center text-slate-400">Verifying administrative credentials...</div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
}

function ProtectedConductorRoute({ children }) {
  const { isAuthenticated, loading } = useConductorAuth();
  if (loading) return <div className="p-8 text-center text-slate-400">Verifying conductor shift credentials...</div>;
  if (!isAuthenticated) return <Navigate to="/conductor/login" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/access" element={<AdminLoginChoice />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/heatmap" element={<MysoreHeatmap />} />
        <Route path="/live-tracking" element={<LiveTracking />} />
      </Route>

      {/* Passenger Public Auth */}
      <Route path="/passenger/login" element={<PassengerLogin />} />
      <Route path="/passenger/register" element={<PassengerRegister />} />

      {/* Passenger Protected Routes */}
      <Route
        path="/passenger"
        element={
          <ProtectedPassengerRoute>
            <PassengerLayout />
          </ProtectedPassengerRoute>
        }
      >
        <Route index element={<Navigate to="/passenger/home" replace />} />
        <Route path="home" element={<PassengerHome />} />
        <Route path="trains" element={<TrainSelection />} />
        <Route path="destination" element={<DestinationSelection />} />
        <Route path="routes" element={<RouteDetails />} />
        <Route path="booking" element={<BookingPage />} />
        <Route path="payment/:bookingId" element={<PaymentPage />} />
        <Route path="ticket/:id" element={<TicketPage />} />
        <Route path="pool-progress/:id" element={<PoolProgress />} />
        <Route path="trips" element={<BookingHistory />} />
        <Route path="profile" element={<PassengerProfile />} />
        <Route path="notifications" element={<BookingHistory />} />
        <Route path="live-tracking" element={<LiveTracking />} />
        <Route path="heatmap" element={<MysoreHeatmap />} />
        <Route path="about" element={<AboutUs />} />
      </Route>

      {/* Admin Public Auth */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin Protected Command Center */}
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="passengers" element={<PassengerManagement />} />
        <Route path="trains" element={<TrainManagement />} />
        <Route path="train-monitoring" element={<TrainMonitoring />} />
        <Route path="bookings" element={<BookingManagement />} />
        <Route path="pools" element={<PoolManagement />} />
        <Route path="destinations" element={<DestinationManagement />} />
        <Route path="routes" element={<RouteDetails />} />
        <Route path="vehicles" element={<VehicleManagement />} />
        <Route path="drivers" element={<DriverManagement />} />
        <Route path="dispatch" element={<DispatchManagement />} />
        <Route path="payments" element={<PaymentManagement />} />
        <Route path="tickets" element={<TicketManagement />} />
        <Route path="analytics" element={<DemandAnalytics />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Conductor Public Auth */}
      <Route path="/conductor/login" element={<ConductorLogin />} />

      {/* Conductor Protected Portal */}
      <Route
        path="/conductor"
        element={
          <ProtectedConductorRoute>
            <ConductorLayout />
          </ProtectedConductorRoute>
        }
      >
        <Route index element={<Navigate to="/conductor/dashboard" replace />} />
        <Route path="dashboard" element={<ConductorDashboard />} />
        <Route path="scanner" element={<QRScanner />} />
        <Route path="manual" element={<ManualValidation />} />
        <Route path="manifest" element={<PassengerManifest />} />
      </Route>

      {/* Fallback 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
