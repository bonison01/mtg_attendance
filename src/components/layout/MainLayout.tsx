
import React from 'react';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
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
