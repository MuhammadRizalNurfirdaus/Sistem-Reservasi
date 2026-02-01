import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminReservationsPage from './pages/admin/AdminReservationsPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import ReservationFormPage from './pages/ReservationFormPage';
import MyReservationsPage from './pages/MyReservationsPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main className="page-wrapper">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="services" element={<AdminServicesPage />} />
              <Route path="reservations" element={<AdminReservationsPage />} />
              <Route path="profile" element={<AdminProfilePage />} />
            </Route>

            {/* Owner Routes */}
            <Route path="/owner" element={<OwnerDashboardPage />} />

            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:id" element={<ServiceDetailPage />} />
            <Route path="/reserve/:itemId" element={<ReservationFormPage />} />
            <Route path="/book" element={<ReservationFormPage />} />
            <Route path="/my-reservations" element={<MyReservationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
