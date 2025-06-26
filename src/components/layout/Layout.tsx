import type { ReactNode } from 'react';
import { useUIStore } from '../../stores/uiStore.js';
import Header from './Header.js';
import Sidebar from './Sidebar.js';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isSidebarOpen, isMobile } = useUIStore();

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div
        className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
          ${isSidebarOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'}
          w-80 transition-transform duration-300 ease-in-out
        `}
      >
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => useUIStore.getState().setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
