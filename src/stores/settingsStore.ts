import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Settings {
  apiEndpoint: string;
  theme: 'dark' | 'light' | 'auto';
  autoSave: boolean;
}

interface SettingsStore extends Settings {
  // Actions
  updateSettings: (settings: Partial<Settings>) => void;
  setApiEndpoint: (endpoint: string) => void;
  setTheme: (theme: 'dark' | 'light' | 'auto') => void;
  setAutoSave: (autoSave: boolean) => void;
  resetToDefaults: () => void;
}

const defaultSettings: Settings = {
  apiEndpoint: 'http://localhost:9091',
  theme: 'dark',
  autoSave: true,
};

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        ...defaultSettings,

        // Actions
        updateSettings: (newSettings) =>
          set((state) => ({ ...state, ...newSettings })),

        setApiEndpoint: (endpoint) =>
          set({ apiEndpoint: endpoint }),

        setTheme: (theme) =>
          set({ theme }),

        setAutoSave: (autoSave) =>
          set({ autoSave }),

        resetToDefaults: () =>
          set(defaultSettings),
      }),
      {
        name: 'opencode-settings',
        // Only persist these specific settings
        partialize: (state) => ({
          apiEndpoint: state.apiEndpoint,
          theme: state.theme,
          autoSave: state.autoSave,
        }),
      }
    ),
    { name: 'OpenCode Settings Store' }
  )
);
