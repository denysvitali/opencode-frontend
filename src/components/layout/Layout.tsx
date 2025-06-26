import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useUIStore } from '../../stores/uiStore.js';
import Header from './Header.js';
import Sidebar from './Sidebar.js';
import Navigation from './Navigation.js';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isSidebarOpen, isMobile } = useUIStore();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Delay initialization to prevent flash
    const timer = setTimeout(() => setHasInitialized(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div
        className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
          ${hasInitialized ? 'transition-all duration-300 ease-in-out' : ''}
          ${isSidebarOpen ? 'w-80' : 'w-0'}
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          overflow-hidden
        `}
      >
        <div className="w-80 h-full">
          <Sidebar />
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => useUIStore.getState().setSidebarOpen(false)}
        />
      )}

      {/* Main content - now properly expands when sidebar is hidden */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <Navigation />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
