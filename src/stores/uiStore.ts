import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { UIState } from '../types/index.js';

interface UIStore extends UIState {
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      // Initial state
      isSidebarOpen: false,
      isMobile: false,
      theme: 'system',

      // Actions
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      
      setIsMobile: (isMobile) => set({ 
        isMobile,
        // Auto-close sidebar on mobile
        isSidebarOpen: isMobile ? false : undefined 
      }),
      
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'OpenCode UI Store' }
  )
);
