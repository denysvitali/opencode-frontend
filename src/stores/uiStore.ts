import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { UIState, ViewType } from '../types/index.js';

interface UIStore extends UIState {
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setActiveView: (view: ViewType) => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      isSidebarOpen: false,
      isMobile: false,
      theme: 'system',
      activeView: 'chat',

      // Actions
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      
      setIsMobile: (isMobile) => {
        const currentState = get();
        set({ 
          isMobile,
          // Only open sidebar on desktop if it's not explicitly closed
          isSidebarOpen: isMobile ? false : !currentState.isSidebarOpen ? true : currentState.isSidebarOpen
        });
      },
      
      setTheme: (theme) => set({ theme }),
      
      setActiveView: (view) => set({ activeView: view }),
    }),
    { name: 'OpenCode UI Store' }
  )
);
