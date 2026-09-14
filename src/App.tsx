import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ModeProvider } from './context/ModeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';

// Public pages
import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { ServiceDetails } from './pages/ServiceDetails';
import { Freelancers } from './pages/Freelancers';
import { FreelancerProfile } from './pages/FreelancerProfile';
import { Resources } from './pages/Resources';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Messages } from './pages/Messages';
import { Notifications } from './pages/Notifications';
import { ProfilePage } from './pages/Profile';
import { PlaceOrder } from './pages/PlaceOrder';
import { SettingsPage } from './pages/Settings';

// Auth pages
import { Login } from './pages/auth/Login';
import { SignUp } from './pages/auth/SignUp';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';

// Student pages
import { StudentDashboard } from './pages/student/Dashboard';
import { MyRequests } from './pages/student/MyRequests';

// Freelancer pages
import { FreelancerDashboard } from './pages/freelancer/Dashboard';
import { MyServices } from './pages/freelancer/MyServices';
import { CreateService } from './pages/freelancer/CreateService';
import { ActiveOrders } from './pages/freelancer/ActiveOrders';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminFreelancers } from './pages/admin/AdminFreelancers';
import { AdminServices } from './pages/admin/AdminServices';
import { AdminResources } from './pages/admin/AdminResources';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminComplaints } from './pages/admin/AdminComplaints';
import { AdminReports } from './pages/admin/AdminReports';

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF9F4]">
        <div className="w-9 h-9 rounded-full border-2 border-[#1B382B] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ModeProvider>
          <div className="min-h-screen flex flex-col bg-[#FBF9F4] text-[#1B382B] selection:bg-[#2D5A43]/20 selection:text-[#1B382B]">
            <Navbar />
            <main className="flex-1 pb-20 lg:pb-0">
              <Routes>
                {/* Public General Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/:id" element={<ServiceDetails />} />
                <Route path="/freelancers" element={<Freelancers />} />
                <Route path="/freelancers/:id" element={<FreelancerProfile />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Authenticated Shared Routes */}
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/new/:serviceId"
                  element={
                    <ProtectedRoute>
                      <PlaceOrder />
                    </ProtectedRoute>
                  }
                />

                {/* Student Mode Specific Routes */}
                <Route
                  path="/student/dashboard"
                  element={
                    <ProtectedRoute>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/requests"
                  element={
                    <ProtectedRoute>
                      <MyRequests />
                    </ProtectedRoute>
                  }
                />

                {/* Freelancer Mode Specific Routes */}
                <Route
                  path="/freelancer/dashboard"
                  element={
                    <ProtectedRoute>
                      <FreelancerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/freelancer/services"
                  element={
                    <ProtectedRoute>
                      <MyServices />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/freelancer/services/new"
                  element={
                    <ProtectedRoute>
                      <CreateService />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/freelancer/services/edit/:id"
                  element={
                    <ProtectedRoute>
                      <CreateService />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/freelancer/orders"
                  element={
                    <ProtectedRoute>
                      <ActiveOrders />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Management Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/students"
                  element={
                    <ProtectedRoute>
                      <AdminStudents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/freelancers"
                  element={
                    <ProtectedRoute>
                      <AdminFreelancers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/services"
                  element={
                    <ProtectedRoute>
                      <AdminServices />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/resources"
                  element={
                    <ProtectedRoute>
                      <AdminResources />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute>
                      <AdminOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/complaints"
                  element={
                    <ProtectedRoute>
                      <AdminComplaints />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute>
                      <AdminReports />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <MobileBottomNav />
          </div>
        </ModeProvider>
      </AuthProvider>
    </Router>
  );
};
export default App;
