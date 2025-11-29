import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type DeviceType = 'mobile' | 'desktop';

interface UIContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  device: DeviceType;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [device, setDevice] = useState<DeviceType>('desktop');

  useEffect(() => {
    const detect = () => {
      const ua = navigator.userAgent || '';
      const isMobile = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(ua) || window.innerWidth < 768;
      setDevice(isMobile ? 'mobile' : 'desktop');

      // add class for styling
      if (isMobile) document.documentElement.classList.add('is-mobile');
      else document.documentElement.classList.remove('is-mobile');
    };

    detect();
    window.addEventListener('resize', detect);
    return () => window.removeEventListener('resize', detect);
  }, []);

  const toggleSidebar = () => setSidebarOpen((s) => !s);

  return (
    <UIContext.Provider value={{ sidebarOpen, toggleSidebar, device }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
}
