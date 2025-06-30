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

interface AppStore extends AppState {
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
  
  // Real API integration methods
  loadWorkspacesFromAPI: () => Promise<void>;
  createWorkspaceAPI: (name: string, repositoryUrl?: string) => Promise<void>;
  deleteWorkspaceAPI: (workspaceId: string) => Promise<void>;
  loadSessionsFromAPI: (workspaceId: string) => Promise<void>;
  createSessionAPI: (workspaceId: string, name: string) => Promise<void>;
  deleteSessionAPI: (sessionId: string) => Promise<void>;
  checkHealthAPI: () => Promise<void>;
}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        workspaces: [],
        sessions: [],
        messages: [],
        activeWorkspaceId: null,
        activeSessionId: null,
        connectionStatus: 'disconnected',
        isLoading: false,
        error: null,

        // Computed properties
        get activeWorkspace() {
          const state = get();
          return state.workspaces.find(ws => ws.id === state.activeWorkspaceId) || null;
        },
        get activeSession() {
          const state = get();
          return state.sessions.find(session => session.id === state.activeSessionId) || null;
        },

        // Actions
        setUser: (user) => set({ user }),

        setActiveWorkspace: (workspaceId) => set({ activeWorkspaceId: workspaceId }),
        
        setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),

        addWorkspace: (workspace) =>
          set((state) => {
            // Check if workspace already exists to prevent duplicates
            const exists = state.workspaces.some(ws => ws.id === workspace.id);
            if (exists) {
              return state; // Don't add if it already exists
            }
            
            return {
              workspaces: [workspace, ...state.workspaces],
              activeWorkspaceId: workspace.id,
            };
          }),

        updateWorkspace: (workspaceId, updates) =>
          set((state) => ({
            workspaces: state.workspaces.map((ws) =>
              ws.id === workspaceId ? { ...ws, ...updates } : ws
            ),
          })),

        deleteWorkspace: (workspaceId) =>
          set((state) => {
            const newWorkspaces = state.workspaces.filter((ws) => ws.id !== workspaceId);
            // Also remove all sessions for this workspace
            const newSessions = state.sessions.filter((session) => session.workspaceId !== workspaceId);
            // Also remove all messages for sessions in this workspace
            const sessionIdsToRemove = state.sessions
              .filter((session) => session.workspaceId === workspaceId)
              .map((session) => session.id);
            const newMessages = state.messages.filter((msg) => !sessionIdsToRemove.includes(msg.sessionId || ''));
            
            return {
              workspaces: newWorkspaces,
              sessions: newSessions,
              messages: newMessages,
              activeWorkspaceId:
                state.activeWorkspaceId === workspaceId
                  ? newWorkspaces[0]?.id || null
                  : state.activeWorkspaceId,
              activeSessionId:
                sessionIdsToRemove.includes(state.activeSessionId || '')
                  ? null
                  : state.activeSessionId,
            };
          }),
          
        addSession: (session) =>
          set((state) => {
            // Check if session already exists to prevent duplicates
            const exists = state.sessions.some(s => s.id === session.id);
            if (exists) {
              return state; // Don't add if it already exists
            }
            
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
            // Also remove all messages for this session
            const newMessages = state.messages.filter((msg) => msg.sessionId !== sessionId);
            
            return {
              sessions: newSessions,
              messages: newMessages,
              activeSessionId:
                state.activeSessionId === sessionId
                  ? newSessions[0]?.id || null
                  : state.activeSessionId,
            };
          }),

        addMessage: (message) =>
          set((state) => {
            // Check if message already exists to prevent duplicates
            const exists = state.messages.some(msg => msg.id === message.id);
            if (exists) {
              return state; // Don't add if it already exists
            }
            
            // Update session's updatedAt timestamp
            const updatedSessions = state.sessions.map((session) =>
              session.id === message.sessionId
                ? { ...session, updatedAt: new Date() }
                : session
            );
            
            return {
              messages: [...state.messages, message],
              sessions: updatedSessions,
            };
          }),

        updateMessage: (messageId, updates) =>
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === messageId ? { ...msg, ...updates } : msg
            ),
          })),

        setConnectionStatus: (status) => set({ connectionStatus: status }),

        setLoading: (loading) => set({ isLoading: loading }),

        setError: (error) => set({ error }),

        clearError: () => set({ error: null }),

        // Real API integration methods
        loadWorkspacesFromAPI: async () => {
          try {
            set({ isLoading: true, error: null });
            const dataService = await getDataService();
            const workspaces = await dataService.loadWorkspaces();
            set({ workspaces, isLoading: false });
          } catch (error) {
            set({ 
              error: { 
                message: error instanceof Error ? error.message : 'Failed to load workspaces',
                code: 'LOAD_WORKSPACES_ERROR'
              },
              isLoading: false 
            });
          }
        },

        createWorkspaceAPI: async (name: string, repositoryUrl?: string) => {
          try {
            set({ isLoading: true, error: null });
            const dataService = await getDataService();
            const newWorkspace = await dataService.createWorkspace(name, repositoryUrl);
            
            set((state) => ({
              workspaces: [newWorkspace, ...state.workspaces],
              activeWorkspaceId: newWorkspace.id,
              isLoading: false,
            }));
          } catch (error) {
            set({ 
              error: { 
                message: error instanceof Error ? error.message : 'Failed to create workspace',
                code: 'CREATE_WORKSPACE_ERROR'
              },
              isLoading: false 
            });
          }
        },

        deleteWorkspaceAPI: async (workspaceId: string) => {
          try {
            set({ isLoading: true, error: null });
            const dataService = await getDataService();
            await dataService.deleteWorkspace(workspaceId);
            
            // Use the local deleteWorkspace action to update state
            const { deleteWorkspace } = get();
            deleteWorkspace(workspaceId);
            
            set({ isLoading: false });
          } catch (error) {
            set({ 
              error: { 
                message: error instanceof Error ? error.message : 'Failed to delete workspace',
                code: 'DELETE_WORKSPACE_ERROR'
              },
              isLoading: false 
            });
          }
        },
        
        loadSessionsFromAPI: async (workspaceId: string) => {
          try {
            set({ isLoading: true, error: null });
            const dataService = await getDataService();
            const sessions = await dataService.loadSessions(workspaceId);
            // Filter existing sessions for this workspace and add new ones
            set((state) => ({
              sessions: [
                ...state.sessions.filter(s => s.workspaceId !== workspaceId),
                ...sessions
              ],
              isLoading: false
            }));
          } catch (error) {
            set({ 
              error: { 
                message: error instanceof Error ? error.message : 'Failed to load sessions',
                code: 'LOAD_SESSIONS_ERROR'
              },
              isLoading: false 
            });
          }
        },

        createSessionAPI: async (workspaceId: string, name: string) => {
          try {
            set({ isLoading: true, error: null });
            const dataService = await getDataService();
            const newSession = await dataService.createSession(workspaceId, name);
            
            set((state) => ({
              sessions: [newSession, ...state.sessions],
              activeSessionId: newSession.id,
              isLoading: false,
            }));
          } catch (error) {
            set({ 
              error: { 
                message: error instanceof Error ? error.message : 'Failed to create session',
                code: 'CREATE_SESSION_ERROR'
              },
              isLoading: false 
            });
          }
        },

        deleteSessionAPI: async (sessionId: string) => {
          try {
            set({ isLoading: true, error: null });
            const dataService = await getDataService();
            const session = get().sessions.find(s => s.id === sessionId);
            if (session) {
              await dataService.deleteSession(session.workspaceId, sessionId);
            }
            
            // Use the local deleteSession action to update state
            const { deleteSession } = get();
            deleteSession(sessionId);
            
            set({ isLoading: false });
          } catch (error) {
            set({ 
              error: { 
                message: error instanceof Error ? error.message : 'Failed to delete session',
                code: 'DELETE_SESSION_ERROR'
              },
              isLoading: false 
            });
          }
        },

        checkHealthAPI: async () => {
          try {
            const dataService = await getDataService();
            const health = await dataService.checkHealth();
            set({ connectionStatus: health.status === 'connected' ? 'connected' : 'disconnected' });
          } catch (err) {
            console.error('Health check failed:', err);
            set({ connectionStatus: 'error' });
          }
        },

        // Export/Import functionality
        exportWorkspaces: () => {
          const state = get();
          const exportData = {
            version: '2.0',
            timestamp: new Date().toISOString(),
            workspaces: state.workspaces,
            sessions: state.sessions,
            messages: state.messages,
            user: state.user
          };
          return JSON.stringify(exportData, null, 2);
        },

        exportWorkspace: (workspaceId: string) => {
          const state = get();
          const workspace = state.workspaces.find(ws => ws.id === workspaceId);
          if (!workspace) return null;
          
          const workspaceSessions = state.sessions.filter(s => s.workspaceId === workspaceId);
          const sessionIds = workspaceSessions.map(s => s.id);
          const workspaceMessages = state.messages.filter(m => sessionIds.includes(m.sessionId || ''));
          
          const exportData = {
            version: '2.0',
            timestamp: new Date().toISOString(),
            workspace,
            sessions: workspaceSessions,
            messages: workspaceMessages
          };
          return JSON.stringify(exportData, null, 2);
        },

        importWorkspaces: async (data: string) => {
          try {
            const importData = JSON.parse(data);
            
            // Validate import data structure
            if (!importData.version || !importData.workspaces) {
              throw new Error('Invalid import data format');
            }

            const state = get();
            const existingWorkspaceIds = new Set(state.workspaces.map(ws => ws.id));
            const existingSessionIds = new Set(state.sessions.map(s => s.id));
            const existingMessageIds = new Set(state.messages.map(m => m.id));
            
            const newWorkspaces = importData.workspaces.filter(
              (ws: Workspace) => !existingWorkspaceIds.has(ws.id)
            );
            const newSessions = (importData.sessions || []).filter(
              (s: Session) => !existingSessionIds.has(s.id)
            );
            const newMessages = (importData.messages || []).filter(
              (m: Message) => !existingMessageIds.has(m.id)
            );

            if (newWorkspaces.length === 0 && newSessions.length === 0 && newMessages.length === 0) {
              throw new Error('No new data to import');
            }

            // Add new data
            set((state) => ({
              workspaces: [...state.workspaces, ...newWorkspaces],
              sessions: [...state.sessions, ...newSessions],
              messages: [...state.messages, ...newMessages]
            }));

            return true;
          } catch (error) {
            console.error('Import failed:', error);
            set({ 
              error: { 
                message: error instanceof Error ? error.message : 'Failed to import workspaces',
                code: 'IMPORT_ERROR'
              }
            });
            return false;
          }
        },
      }),
      {
        name: 'opencode-app-store',
        partialize: (state) => ({
          user: state.user,
          workspaces: state.workspaces,
          sessions: state.sessions,
          messages: state.messages,
          activeWorkspaceId: state.activeWorkspaceId,
          activeSessionId: state.activeSessionId,
        }),
      }
    ),
    { name: 'OpenCode App Store' }
  )
);
