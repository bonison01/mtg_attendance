
import React, { useEffect, useState } from 'react';
import { MenuIcon } from 'lucide-react';
import { ModeToggle } from '../ui/theme-toggle';
import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { fetchCompanySettings } from '@/services/companySettingsService';

const Header = () => {
  const { toggle, isOpen } = useSidebar();
  const [companyName, setCompanyName] = useState('BioPulse Inc.');

  useEffect(() => {
    // Try to get company name from database first
    const loadCompanySettings = async () => {
      const settings = await fetchCompanySettings();
      if (settings?.company_name) {
        setCompanyName(settings.company_name);
      } else {
        // Fallback to localStorage
        const savedCompanyName = localStorage.getItem('companyName');
        if (savedCompanyName) {
          setCompanyName(savedCompanyName);
        }
      }
    };
    
    loadCompanySettings();

    // Listen for company name changes in localStorage
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
      style={{ 
        borderColor: localStorage.getItem('brandColor') || '#1e3a8a' 
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={toggle}
        className="md:hidden"
      >
        <MenuIcon className="h-5 w-5" />
      </Button>

      <div 
        className="font-semibold text-lg"
        style={{ 
          color: localStorage.getItem('brandColor') || '#1e3a8a' 
        }}
      >
        {companyName}
      </div>

      <div className="flex items-center">
        <ModeToggle />
      </div>
    </header>
  );
};

export default Header;
