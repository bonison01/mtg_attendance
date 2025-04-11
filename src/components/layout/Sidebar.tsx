
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Users, Calendar, ClipboardCheck, Settings, 
  LogOut, BarChart2, UserPlus, Fingerprint 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Sidebar = () => {
  const { signOut, isAdmin } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home, showAlways: true },
    { name: 'Employees', path: '/employees', icon: Users, adminOnly: true },
    { name: 'Register Employee', path: '/register', icon: UserPlus, adminOnly: true },
    { name: 'Attendance', path: '/attendance', icon: ClipboardCheck, adminOnly: false },
    { name: 'Clock In/Out', path: '/clock', icon: Fingerprint, adminOnly: false },
    { name: 'Reports', path: '/reports', icon: BarChart2, adminOnly: true },
    { name: 'Settings', path: '/settings', icon: Settings, adminOnly: true },
  ];

  return (
    <div className="hidden md:flex flex-col h-screen w-64 bg-brand-800 text-white">
      <div className="px-6 py-8">
        <h2 className="text-xl font-bold flex items-center">
          <Fingerprint className="mr-2" />
          BioPulse
        </h2>
        <p className="text-xs text-gray-300 mt-1">Attendance Management</p>
      </div>
      
      <nav className="flex-1 px-4 pb-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            // Skip admin-only items if user is not admin
            if (item.adminOnly && !isAdmin) return null;
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
                      isActive
                        ? "bg-brand-700 text-white font-medium"
                        : "text-gray-300 hover:bg-brand-700/50 hover:text-white"
                    )
                  }
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="px-4 pb-6">
        <Button
          variant="ghost" 
          className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-brand-700/50 hover:text-white rounded-md w-full transition-colors"
          onClick={() => signOut()}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
