import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { getDataService } from '../services/dataService.js';
import type { 
  AppState, 
  Workspace,
  Session,
  Message, 
  ConnectionStatus, 
  APIError, 
  User 
} from '../types/index.js';

interface WorkspaceAppStore extends AppState {
  // Computed properties
  activeWorkspace: Workspace | null;
  activeSession: Session | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setActiveWorkspace: (workspaceId: string | null) => void;
  setActiveSession: (sessionId: string | null) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (workspaceId: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (workspaceId: string) => void;
  addSession: (session: Session) => void;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  deleteSession: (sessionId: string) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: APIError | null) => void;
  clearError: () => void;
  
  // API integration methods
  loadWorkspacesFromAPI: () => Promise<void>;
  createWorkspaceAPI: (name: string, repositoryUrl?: string) => Promise<void>;
  deleteWorkspaceAPI: (workspaceId: string) => Promise<void>;
  loadSessionsFromAPI: (workspaceId: string) => Promise<void>;
  createSessionAPI: (workspaceId: string, name: string) => Promise<void>;
  deleteSessionAPI: (workspaceId: string, sessionId: string) => Promise<void>;
  checkHealthAPI: () => Promise<void>;
}

export const useWorkspaceAppStore = create<WorkspaceAppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        workspaces: [],
        sessions: [],
        activeWorkspaceId: null,
        activeSessionId: null,
        connectionStatus: 'disconnected',
        isLoading: false,
        error: null,

        // Computed properties
        get activeWorkspace() {
          const state = get();
          return state.workspaces.find(workspace => workspace.id === state.activeWorkspaceId) || null;
        },

        get activeSession() {
          const state = get();
          return state.sessions.find(session => session.id === state.activeSessionId) || null;
        },

        // Actions
        setUser: (user) => set({ user }),

        setActiveWorkspace: (workspaceId) => 
          set({ 
            activeWorkspaceId: workspaceId,
            activeSessionId: null, // Clear active session when switching workspaces
            sessions: [], // Clear sessions from previous workspace
          }),

        setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),

        addWorkspace: (workspace) =>
          set((state) => {
            const exists = state.workspaces.some(w => w.id === workspace.id);
            if (exists) return state;
            
            return {
              workspaces: [workspace, ...state.workspaces],
              activeWorkspaceId: workspace.id,
            };
          }),

        updateWorkspace: (workspaceId, updates) =>
          set((state) => ({
            workspaces: state.workspaces.map((workspace) =>
              workspace.id === workspaceId ? { ...workspace, ...updates } : workspace
            ),
          })),

        deleteWorkspace: (workspaceId) =>
          set((state) => {
            const newWorkspaces = state.workspaces.filter((workspace) => workspace.id !== workspaceId);
            return {
              workspaces: newWorkspaces,
              activeWorkspaceId:
                state.activeWorkspaceId === workspaceId
                  ? newWorkspaces[0]?.id || null
                  : state.activeWorkspaceId,
              // Clear sessions if deleting active workspace
              sessions: state.activeWorkspaceId === workspaceId ? [] : state.sessions,
              activeSessionId: state.activeWorkspaceId === workspaceId ? null : state.activeSessionId,
            };
          }),

        addSession: (session) =>
          set((state) => {
            const exists = state.sessions.some(s => s.id === session.id);
            if (exists) return state;
            
            return {
              sessions: [session, ...state.sessions],
              activeSessionId: session.id,
            };
          }),

        updateSession: (sessionId, updates) =>
          set((state) => ({
            sessions: state.sessions.map((session) =>
              session.id === sessionId ? { ...session, ...updates } : session
            ),
          })),

        deleteSession: (sessionId) =>
          set((state) => {
            const newSessions = state.sessions.filter((session) => session.id !== sessionId);
            return {
              sessions: newSessions,
              activeSessionId:
                state.activeSessionId === sessionId
                  ? newSessions[0]?.id || null
                  : state.activeSessionId,
            };
          }),

        addMessage: (message) =>
          set((state) => ({
            sessions: state.sessions.map((session) =>
              session.id === message.sessionId
                ? { ...session, messages: [...session.messages, message] }
                : session
            ),
          })),

        updateMessage: (messageId, updates) =>
          set((state) => ({
            sessions: state.sessions.map((session) => ({
              ...session,
              messages: session.messages.map((msg) =>
                msg.id === messageId ? { ...msg, ...updates } : msg
              ),
            }))
          })),

        setConnectionStatus: (status) => set({ connectionStatus: status }),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),

        // API integration methods
        async loadWorkspacesFromAPI() {
          try {
            set({ isLoading: true, error: null });
            const dataService = getDataService();
            const workspaces = await dataService.loadWorkspaces();
            set({ workspaces, isLoading: false });
          } catch (error) {
            console.error('Failed to load workspaces:', error);
            set({ 
              error: { 
                code: 'LOAD_WORKSPACES_FAILED', 
                message: error instanceof Error ? error.message : 'Failed to load workspaces' 
              }, 
              isLoading: false 
            });
          }
        },

        async createWorkspaceAPI(name, repositoryUrl) {
          try {
            set({ isLoading: true, error: null });
            const dataService = getDataService();
            const workspace = await dataService.createWorkspace(name, repositoryUrl);
            const state = get();
            state.addWorkspace(workspace);
            set({ isLoading: false });
          } catch (error) {
            console.error('Failed to create workspace:', error);
            set({ 
              error: { 
                code: 'CREATE_WORKSPACE_FAILED', 
                message: error instanceof Error ? error.message : 'Failed to create workspace' 
              }, 
              isLoading: false 
            });
          }
        },

        async deleteWorkspaceAPI(workspaceId) {
          try {
            set({ isLoading: true, error: null });
            const dataService = getDataService();
            await dataService.deleteWorkspace(workspaceId);
            const state = get();
            state.deleteWorkspace(workspaceId);
            set({ isLoading: false });
          } catch (error) {
            console.error('Failed to delete workspace:', error);
            set({ 
              error: { 
                code: 'DELETE_WORKSPACE_FAILED', 
                message: error instanceof Error ? error.message : 'Failed to delete workspace' 
              }, 
              isLoading: false 
            });
          }
        },

        async loadSessionsFromAPI(workspaceId) {
          try {
            set({ isLoading: true, error: null });
            const dataService = getDataService();
            const sessions = await dataService.loadSessions(workspaceId);
            set({ sessions, isLoading: false });
          } catch (error) {
            console.error('Failed to load sessions:', error);
            set({ 
              error: { 
                code: 'LOAD_SESSIONS_FAILED', 
                message: error instanceof Error ? error.message : 'Failed to load sessions' 
              }, 
              isLoading: false 
            });
          }
        },

        async createSessionAPI(workspaceId, name) {
          try {
            set({ isLoading: true, error: null });
            const dataService = getDataService();
            const session = await dataService.createSession(workspaceId, name);
            const state = get();
            state.addSession(session);
            set({ isLoading: false });
          } catch (error) {
            console.error('Failed to create session:', error);
            set({ 
              error: { 
                code: 'CREATE_SESSION_FAILED', 
                message: error instanceof Error ? error.message : 'Failed to create session' 
              }, 
              isLoading: false 
            });
          }
        },

        async deleteSessionAPI(workspaceId, sessionId) {
          try {
            set({ isLoading: true, error: null });
            const dataService = getDataService();
            await dataService.deleteSession(workspaceId, sessionId);
            const state = get();
            state.deleteSession(sessionId);
            set({ isLoading: false });
          } catch (error) {
            console.error('Failed to delete session:', error);
            set({ 
              error: { 
                code: 'DELETE_SESSION_FAILED', 
                message: error instanceof Error ? error.message : 'Failed to delete session' 
              }, 
              isLoading: false 
            });
          }
        },

        async checkHealthAPI() {
          try {
            const dataService = getDataService();
            const health = await dataService.checkHealth();
            set({ connectionStatus: health.status });
          } catch (error) {
            console.error('Health check failed:', error);
            set({ connectionStatus: 'error' });
          }
        },
      }),
      {
        name: 'opencode-workspace-app-store',
        partialize: (state) => ({ 
          user: state.user,
          activeWorkspaceId: state.activeWorkspaceId,
          activeSessionId: state.activeSessionId,
        }),
      }
    ),
    { name: 'workspace-app-store' }
  )
);

// Re-export original store for backwards compatibility
export { useAppStore } from './appStore.js';
