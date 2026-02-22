import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import StreamersPage from './pages/StreamersPage';
import StreamerPage from './pages/StreamerPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddMatchPage from './pages/admin/AddMatchPage';
import ManageStreamersPage from './pages/admin/ManageStreamersPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/streamers" element={<StreamersPage />} />
          <Route path="/streamer/:id" element={<StreamerPage />} />
        </Route>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="match/new" element={<AddMatchPage />} />
          <Route path="streamers" element={<ManageStreamersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
