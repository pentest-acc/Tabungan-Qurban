import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useTheme } from './context/ThemeContext';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Public
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Jamaah
import DashboardJamaah from './pages/jamaah/DashboardJamaah';
import ProfilJamaah from './pages/jamaah/ProfilJamaah';
import DaftarKelompok from './pages/jamaah/DaftarKelompok';
import DetailKelompok from './pages/jamaah/DetailKelompok';
import AjukanGabung from './pages/jamaah/AjukanGabung';
import DetailTagihan from './pages/jamaah/DetailTagihan';
import RiwayatTransaksi from './pages/jamaah/RiwayatTransaksi';
import Pembayaran from './pages/jamaah/Pembayaran';
import InstruksiPembayaran from './pages/jamaah/InstruksiPembayaran';
import HasilPembayaran from './pages/jamaah/HasilPembayaran';

// Admin (admin_biasa & kepala_admin)
import DashboardAdmin from './pages/admin/DashboardAdmin';
import DataJamaah from './pages/admin/DataJamaah';
import DataSapi from './pages/admin/DataSapi';
import DataKelompok from './pages/admin/DataKelompok';
import ValidasiPermintaan from './pages/admin/ValidasiPermintaan';
import MonitoringTransaksi from './pages/admin/MonitoringTransaksi';

// Kepala Admin
import DashboardKepala from './pages/kepala/DashboardKepala';
import KelolaAdmin from './pages/kepala/KelolaAdmin';
import Laporan from './pages/kepala/Laporan';

import Kwitansi from './pages/Kwitansi';
import NotFound from './pages/NotFound';

export default function App() {
  const { dark } = useTheme();

  return (
    <>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* JAMAAH */}
        <Route element={<ProtectedRoute allowedRoles={['jamaah']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/jamaah/dashboard" element={<DashboardJamaah />} />
            <Route path="/jamaah/profil" element={<ProfilJamaah />} />
            <Route path="/jamaah/kelompok" element={<DaftarKelompok />} />
            <Route path="/jamaah/kelompok/:id" element={<DetailKelompok />} />
            <Route path="/jamaah/gabung" element={<AjukanGabung />} />
            <Route path="/jamaah/tagihan" element={<DetailTagihan />} />
            <Route path="/jamaah/transaksi" element={<RiwayatTransaksi />} />
            <Route path="/jamaah/pembayaran" element={<Pembayaran />} />
            <Route path="/jamaah/pembayaran/instruksi/:ref" element={<InstruksiPembayaran />} />
            <Route path="/jamaah/pembayaran/hasil/:ref" element={<HasilPembayaran />} />
            <Route path="/jamaah/transaksi/kwitansi/:ref" element={<Kwitansi />} />
          </Route>
        </Route>

        {/* ADMIN BIASA + KEPALA ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={['admin_biasa', 'kepala_admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<DashboardAdmin />} />
            <Route path="/admin/jamaah" element={<DataJamaah />} />
            <Route path="/admin/sapi" element={<DataSapi />} />
            <Route path="/admin/kelompok" element={<DataKelompok />} />
            <Route path="/admin/permintaan" element={<ValidasiPermintaan />} />
            <Route path="/admin/transaksi" element={<MonitoringTransaksi />} />
            <Route path="/admin/transaksi/kwitansi/:ref" element={<Kwitansi />} />
          </Route>
        </Route>

        {/* KHUSUS KEPALA ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={['kepala_admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/kepala/dashboard" element={<DashboardKepala />} />
            <Route path="/kepala/admin" element={<KelolaAdmin />} />
            <Route path="/kepala/laporan" element={<Laporan />} />
          </Route>
        </Route>

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3500} theme={dark ? 'dark' : 'light'} />
    </>
  );
}
