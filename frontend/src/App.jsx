import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';

// Public & Customer Pages
import HomePage from './pages/HomePage';
import CarListPage from './pages/CarListPage';
import CarDetailPage from './pages/CarDetailPage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import ReceiptPage from './pages/ReceiptPage';
import TrackingPage from './pages/TrackingPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PasswordResetPage from './pages/PasswordResetPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminCarListPage from './pages/admin/AdminCarListPage';
import AdminCarFormPage from './pages/admin/AdminCarFormPage';
import AdminBookingListPage from './pages/admin/AdminBookingListPage';
import AdminCustomerListPage from './pages/admin/AdminCustomerListPage';
import AdminCustomerProfilePage from './pages/admin/AdminCustomerProfilePage';
import AdminPaymentListPage from './pages/admin/AdminPaymentListPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminMaintenanceListPage from './pages/admin/AdminMaintenanceListPage';
import AdminActivityLogsPage from './pages/admin/AdminActivityLogsPage';

function CustomerLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public and Customer Portal Routes */}
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/cars" element={<CarListPage />} />
              <Route path="/cars/:id" element={<CarDetailPage />} />
              <Route path="/booking/:id" element={<BookingPage />} />
              <Route path="/payment/:id" element={<PaymentPage />} />
              <Route path="/receipt/:id" element={<ReceiptPage />} />
              <Route path="/tracking/:id" element={<TrackingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/password-reset" element={<PasswordResetPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
            </Route>

            {/* Admin Control Center Routes */}
            <Route path="/admin-panel" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="cars" element={<AdminCarListPage />} />
              <Route path="cars/add" element={<AdminCarFormPage />} />
              <Route path="cars/:id/edit" element={<AdminCarFormPage />} />
              <Route path="bookings" element={<AdminBookingListPage />} />
              <Route path="customers" element={<AdminCustomerListPage />} />
              <Route path="customers/:id" element={<AdminCustomerProfilePage />} />
              <Route path="payments" element={<AdminPaymentListPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="maintenance" element={<AdminMaintenanceListPage />} />
              <Route path="activity-logs" element={<AdminActivityLogsPage />} />
            </Route>
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
