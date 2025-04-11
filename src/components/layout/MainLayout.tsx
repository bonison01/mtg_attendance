
import React from 'react';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { loading } = useAuth();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/auth';

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <div className="p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;
