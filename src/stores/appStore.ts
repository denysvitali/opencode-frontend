import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { getDataService } from '../services/dataService.js';
import type { 
  AppState, 
  Conversation, 
  Message, 
  ConnectionStatus, 
  APIError, 
  User 
} from '../types/index.js';

interface AppStore extends AppState {
  // Computed properties
  activeConversation: Conversation | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setActiveConversation: (conversationId: string | null) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  deleteConversation: (conversationId: string) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: APIError | null) => void;
  clearError: () => void;
  
  // Real API integration methods
  loadConversationsFromAPI: () => Promise<void>;
  createConversationAPI: (title: string, repositoryUrl?: string) => Promise<void>;
  deleteConversationAPI: (conversationId: string) => Promise<void>;
  checkHealthAPI: () => Promise<void>;
}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        conversations: [],
        activeConversationId: null,
        connectionStatus: 'disconnected',
        isLoading: false,
        error: null,

        // Computed properties
        get activeConversation() {
          const state = get();
          return state.conversations.find(conv => conv.id === state.activeConversationId) || null;
        },

        // Actions
        setUser: (user) => set({ user }),

        setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),

        addConversation: (conversation) =>
          set((state) => {
            // Check if conversation already exists to prevent duplicates
            const exists = state.conversations.some(conv => conv.id === conversation.id);
            if (exists) {
              return state; // Don't add if it already exists
            }
            
            return {
              conversations: [conversation, ...state.conversations],
              activeConversationId: conversation.id,
            };
          }),

        updateConversation: (conversationId, updates) =>
          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === conversationId ? { ...conv, ...updates } : conv
            ),
          })),

        deleteConversation: (conversationId) =>
          set((state) => {
            const newConversations = state.conversations.filter((conv) => conv.id !== conversationId);
            return {
              conversations: newConversations,
              activeConversationId:
                state.activeConversationId === conversationId
                  ? newConversations[0]?.id || null
                  : state.activeConversationId,
            };
          }),

        addMessage: (message) =>
          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === message.conversationId
                ? { ...conv, messages: [...conv.messages, message], updatedAt: new Date() }
                : conv
            ),
          })),

        updateMessage: (messageId, updates) =>
          set((state) => ({
            conversations: state.conversations.map((conv) => ({
              ...conv,
              messages: conv.messages.map((msg) =>
                msg.id === messageId ? { ...msg, ...updates } : msg
              ),
            })),
          })),

        setConnectionStatus: (status) => set({ connectionStatus: status }),

        setLoading: (loading) => set({ isLoading: loading }),

        setError: (error) => set({ error }),

        clearError: () => set({ error: null }),

        // Real API integration methods
        loadConversationsFromAPI: async () => {
          try {
            set({ isLoading: true, error: null });
            const dataService = await getDataService();
            const conversations = await dataService.loadConversations();
            set({ conversations, isLoading: false });
          } catch (error) {
            set({ 
              error: { 
                message: error instanceof Error ? error.message : 'Failed to load conversations',
                code: 'LOAD_CONVERSATIONS_ERROR'
              },
              isLoading: false 
            });
          }
        },

        createConversationAPI: async (title: string, repositoryUrl?: string) => {
          try {
            set({ isLoading: true, error: null });
            const dataService = await getDataService();
            const newConversation = await dataService.createConversation(title, repositoryUrl);
            
            set((state) => ({
              conversations: [newConversation, ...state.conversations],
              activeConversationId: newConversation.id,
              isLoading: false,
            }));
          } catch (error) {
            set({ 
              error: { 
                message: error instanceof Error ? error.message : 'Failed to create conversation',
                code: 'CREATE_CONVERSATION_ERROR'
              },
              isLoading: false 
            });
          }
        },

        deleteConversationAPI: async (conversationId: string) => {
          try {
            set({ isLoading: true, error: null });
            const dataService = await getDataService();
            await dataService.deleteConversation(conversationId);
            
            set((state) => {
              const newConversations = state.conversations.filter(conv => conv.id !== conversationId);
              return {
                conversations: newConversations,
                activeConversationId: state.activeConversationId === conversationId
                  ? newConversations[0]?.id || null
                  : state.activeConversationId,
                isLoading: false,
              };
            });
          } catch (error) {
            set({ 
              error: { 
                message: error instanceof Error ? error.message : 'Failed to delete conversation',
                code: 'DELETE_CONVERSATION_ERROR'
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
      }),
      {
        name: 'opencode-app-store',
        partialize: (state) => ({
          user: state.user,
          conversations: state.conversations,
          activeConversationId: state.activeConversationId,
        }),
      }
    ),
    { name: 'OpenCode App Store' }
  )
);
