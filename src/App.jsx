import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

const HomePage = lazy(() => import('./pages/HomePage'));
const StreamersPage = lazy(() => import('./pages/StreamersPage'));
const StreamerPage = lazy(() => import('./pages/StreamerPage'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AddMatchPage = lazy(() => import('./pages/admin/AddMatchPage'));
const EditMatchPage = lazy(() => import('./pages/admin/EditMatchPage'));
const ManageStreamersPage = lazy(() => import('./pages/admin/ManageStreamersPage'));
const SeasonsPage = lazy(() => import('./pages/admin/SeasonsPage'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
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
            <Route path="match/edit/:matchId" element={<EditMatchPage />} />
            <Route path="streamers" element={<ManageStreamersPage />} />
            <Route path="seasons" element={<SeasonsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
