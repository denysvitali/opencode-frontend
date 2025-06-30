import type { Conversation, Message, Workspace, Session } from '../types/index.js';

/**
 * Abstract interface for data services
 * This allows switching between real API and mock data based on build flags
 */
export interface DataService {
  // Health and connection
  checkHealth(): Promise<{ status: 'connected' | 'disconnected'; version?: string; error?: string }>;
  
  // Workspaces
  loadWorkspaces(): Promise<Workspace[]>;
  createWorkspace(name: string, repositoryUrl?: string): Promise<Workspace>;
  deleteWorkspace(workspaceId: string): Promise<void>;
  getWorkspace(workspaceId: string): Promise<Workspace>;
  
  // Sessions
  loadSessions(workspaceId: string): Promise<Session[]>;
  createSession(workspaceId: string, name: string): Promise<Session>;
  deleteSession(workspaceId: string, sessionId: string): Promise<void>;
  getSession(workspaceId: string, sessionId: string): Promise<Session>;
  
  // Messages
  sendMessage(workspaceId: string, sessionId: string, content: string): Promise<Message>;
  getMessages(workspaceId: string, sessionId: string): Promise<Message[]>;
  
  // Files
  getFiles(workspaceId: string, sessionId: string): Promise<Array<{ path: string; type: 'file' | 'directory' }>>;
  getFileContent(workspaceId: string, sessionId: string, filePath: string): Promise<{ content: string; language?: string }>;
  
  // Terminal
  executeCommand(workspaceId: string, sessionId: string, command: string): Promise<{ output: string; exitCode: number }>;
  getTerminalHistory(workspaceId: string, sessionId: string): Promise<Array<{ command: string; output: string; timestamp: Date }>>;
  
  // Git
  getGitStatus(workspaceId: string, sessionId: string): Promise<{
    status: string;
    files: Array<{ path: string; status: 'modified' | 'added' | 'deleted' | 'untracked' }>;
  }>;

  // Legacy methods (for backwards compatibility - will be removed)
  loadConversations(): Promise<Conversation[]>;
  createConversation(title: string, repositoryUrl?: string): Promise<Conversation>;
  deleteConversation(conversationId: string): Promise<void>;
  getConversation(conversationId: string): Promise<Conversation>;
  
  // Configuration
  getCurrentEndpoint(): string;
  configure(options: { userId?: string }): void;
}

/**
 * Factory function to get the appropriate data service based on build mode
 */
export async function createDataService(): Promise<DataService> {
  if (__DEMO_MODE__) {
    // Dynamic import to keep mock code out of production builds
    const module = await import('./mockDataService.js');
    return new module.MockDataService();
  } else {
    const module = await import('./realDataService.js');
    return new module.RealDataService();
  }
}

/**
 * Singleton data service instance
 */
let dataServiceInstance: DataService | null = null;

export async function getDataService(): Promise<DataService> {
  if (!dataServiceInstance) {
    dataServiceInstance = await createDataService();
  }
  return dataServiceInstance;
}
