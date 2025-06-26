import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { 
  AppState, 
  Conversation, 
  Message, 
  ConnectionStatus, 
  APIError, 
  User 
} from '../types/index.js';

interface AppStore extends AppState {
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
}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        user: null,
        conversations: [],
        activeConversationId: null,
        connectionStatus: 'disconnected',
        isLoading: false,
        error: null,

        // Actions
        setUser: (user) => set({ user }),

        setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),

        addConversation: (conversation) =>
          set((state) => ({
            conversations: [conversation, ...state.conversations],
            activeConversationId: conversation.id,
          })),

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
