
import { create } from 'zustand';
import { orchestratorService } from '../services/orchestratorService.js';
import type { Session } from '../types/orchestrator.js';

interface SessionStore {
  sessions: Session[];
  activeSessionId: string | null;
  isLoading: boolean;
  error: string | null;
  fetchSessions: () => Promise<void>;
  createSession: (name: string, repositoryUrl: string, repositoryRef: string) => Promise<void>;
  setActiveSession: (sessionId: string | null) => void;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  isLoading: false,
  error: null,

  fetchSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await orchestratorService.listSessions();
      if (response.data && response.data.sessions) {
        set({ sessions: response.data.sessions, isLoading: false });
      } else {
        set({ sessions: [], isLoading: false, error: 'No sessions found' });
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      set({ isLoading: false, error: 'Failed to fetch sessions' });
    }
  },

  createSession: async (name: string, repositoryUrl: string, repositoryRef: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orchestratorService.createSession({
        userId: 'test-user', // TODO: Replace with actual user ID
        name: name,
        config: {
          repository: {
            url: repositoryUrl,
            ref: repositoryRef,
          },
          environment: {}, // TODO: Allow user to specify environment variables
        },
      });
      if (response.data && response.data.session) {
        // Add the new session to the list and set it as active
        set((state) => ({
          sessions: [...state.sessions, response.data.session!],
          activeSessionId: response.data.session!.id,
          isLoading: false,
        }));
      } else {
        set({ isLoading: false, error: 'Failed to create session: No session data returned' });
      }
    } catch (err: any) {
      console.error('Failed to create session:', err);
      set({ isLoading: false, error: err.message || 'Failed to create session' });
    }
  },

  setActiveSession: (sessionId: string | null) => {
    set({ activeSessionId: sessionId });
  },
}));
