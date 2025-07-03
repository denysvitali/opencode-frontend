import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useUIStore } from '../../stores/uiStore.js';
import Navigation from './Navigation.js';
import BottomNavigation from '../mobile/BottomNavigation.js';

interface LayoutProps {
  children: ReactNode;
  showWorkspaceUI?: boolean; // Controls whether to show navigation and sidebar
}

export default function Layout({ children, showWorkspaceUI = false }: LayoutProps) {
  const { isSidebarOpen, isMobile } = useUIStore();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Delay initialization to prevent flash
    const timer = setTimeout(() => setHasInitialized(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`${showWorkspaceUI ? 'flex' : ''} h-screen bg-gray-900`}>
      {/* Skip to main content link */}
      <a 
        href="#main-content" 
        className="skip-link sr-only focus:not-sr-only fixed top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-[1000] text-sm font-medium"
      >
        Skip to main content
      </a>
      {/* Sidebar - only show when showWorkspaceUI is true */}
      {showWorkspaceUI && (
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
            {/* Legacy sidebar removed */}
          </div>
        </div>
      )}

      {/* Mobile overlay - only show when showWorkspaceUI is true */}
      {showWorkspaceUI && isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => useUIStore.getState().setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className={`${showWorkspaceUI ? 'flex-1' : 'w-full'} flex flex-col overflow-hidden`}>
        {/* Header and Navigation - only show when showWorkspaceUI is true */}
        {showWorkspaceUI && (
          <>
            {/* Legacy header removed */}
            <Navigation />
          </>
        )}
        <main id="main-content" className={`flex-1 overflow-hidden ${isMobile ? 'pb-20' : ''}`} role="main">
          {children}
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
