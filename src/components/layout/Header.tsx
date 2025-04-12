
import React, { useEffect, useState } from 'react';
import { MenuIcon } from 'lucide-react';
import { ModeToggle } from './ThemeToggle';
import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

const Header = () => {
  const { toggle, isOpen } = useSidebar();
  const [companyName, setCompanyName] = useState('BioPulse Inc.');

  useEffect(() => {
    // Load company name from local storage
    const savedCompanyName = localStorage.getItem('companyName');
    if (savedCompanyName) {
      setCompanyName(savedCompanyName);
    }

    // Listen for company name changes
    const handleStorageChange = () => {
      const newCompanyName = localStorage.getItem('companyName');
      if (newCompanyName) {
        setCompanyName(newCompanyName);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check every second for changes in the same tab
    const interval = setInterval(() => {
      const newCompanyName = localStorage.getItem('companyName');
      if (newCompanyName && newCompanyName !== companyName) {
        setCompanyName(newCompanyName);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [companyName]);

  return (
    <header
      className={cn(
        'border-b bg-background px-6 py-3 flex items-center justify-between sticky top-0 z-10',
        isOpen ? 'lg:pl-64' : ''
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={toggle}
        className="md:hidden"
      >
        <MenuIcon className="h-5 w-5" />
      </Button>

      <div className="font-semibold text-lg">{companyName}</div>

      <div className="flex items-center">
        <ModeToggle />
      </div>
    </header>
  );
};

export default Header;
