// Core types for the OpenCode Frontend application

export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface Workspace {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'running' | 'creating' | 'stopped' | 'error';
  config?: {
    repository?: {
      url: string;
      ref?: string;
    };
    environment?: Record<string, string>;
    resources?: {
      limits?: Record<string, string>;
      requests?: Record<string, string>;
    };
  };
  labels?: Record<string, string>;
  userId: string;
}

export interface Session {
  id: string;
  name: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
  state: 'running' | 'creating' | 'stopped' | 'error';
  messages: Message[];
  isActive?: boolean;
  config?: {
    context?: string;
    environment?: Record<string, string>;
  };
  labels?: Record<string, string>;
  userId: string;
}

// Legacy type for backwards compatibility during transition
export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  isActive?: boolean;
  sandboxStatus?: 'connected' | 'connecting' | 'disconnected' | 'error';
  workspaceId: string;
  sessionId?: string;
}

export type MessageType = 'user' | 'assistant' | 'system' | 'command' | 'code' | 'file';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'error';

export interface Message {
  id: string;
  sessionId: string; // Messages belong to sessions, not conversations
  type: MessageType;
  content: string;
  status: MessageStatus;
  timestamp: Date;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  // For command messages
  command?: {
    name: string;
    args: string[];
    exitCode?: number;
    output?: string;
  };
  
  // For code messages
  code?: {
    language: string;
    filename?: string;
    diff?: CodeDiff;
  };
  
  // For file messages
  file?: {
    name: string;
    path: string;
    size: number;
    type: string;
    content?: string;
  };
}

export interface CodeDiff {
  additions: number;
  deletions: number;
  changes: DiffChange[];
}

export interface DiffChange {
  type: 'add' | 'remove' | 'modify';
  line: number;
  content: string;
}

// WebSocket/gRPC related types
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: number;
  id?: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Application state types
export interface AppState {
  user: User | null;
  workspaces: Workspace[];
  sessions: Session[]; // Sessions for the active workspace
  activeWorkspaceId: string | null;
  activeSessionId: string | null;
  connectionStatus: ConnectionStatus;
  isLoading: boolean;
  error: APIError | null;
}

// UI state types
export type ViewType = 'workspaces' | 'sessions' | 'chat' | 'filesystem' | 'terminal' | 'git-diff';

export interface UIState {
  isSidebarOpen: boolean;
  isMobile: boolean;
  theme: 'light' | 'dark' | 'system';
  activeView: ViewType;
}
