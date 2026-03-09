import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import StreamersPage from './pages/StreamersPage';
import StreamerPage from './pages/StreamerPage';
import ContactPage from './pages/ContactPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddMatchPage from './pages/admin/AddMatchPage';
import EditMatchPage from './pages/admin/EditMatchPage';
import ManageStreamersPage from './pages/admin/ManageStreamersPage';
import SeasonsPage from './pages/admin/SeasonsPage';
import InquiriesPage from './pages/admin/InquiriesPage';
import NoticesAdminPage from './pages/admin/NoticesAdminPage';
import NoticePage from './pages/NoticePage';
import NoticesListPage from './pages/NoticesListPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"            element={<HomePage />} />
          <Route path="/streamers"   element={<StreamersPage />} />
          <Route path="/streamer/:id" element={<StreamerPage />} />
          <Route path="/contact"     element={<ContactPage />} />
          <Route path="/notices"      element={<NoticesListPage />} />
          <Route path="/notices/:id"  element={<NoticePage />} />
        </Route>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index                        element={<AdminDashboard />} />
          <Route path="match/new"             element={<AddMatchPage />} />
          <Route path="match/edit/:matchId"   element={<EditMatchPage />} />
          <Route path="streamers"             element={<ManageStreamersPage />} />
          <Route path="seasons"               element={<SeasonsPage />} />
          <Route path="inquiries"             element={<InquiriesPage />} />
          <Route path="notices"               element={<NoticesAdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
