import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import NoticeBanner from './NoticeBanner';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-base w-full">
      <Navbar />
      <NoticeBanner />
      <main className="flex-1 w-full" style={{ display: 'block' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
