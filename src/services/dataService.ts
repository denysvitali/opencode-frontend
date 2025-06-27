import type { Conversation, Message } from '../types/index.js';

/**
 * Abstract interface for data services
 * This allows switching between real API and mock data based on build flags
 */
export interface DataService {
  // Health and connection
  checkHealth(): Promise<{ status: 'connected' | 'disconnected'; version?: string; error?: string }>;
  
  // Conversations/Sessions
  loadConversations(): Promise<Conversation[]>;
  createConversation(title: string, repositoryUrl?: string): Promise<Conversation>;
  deleteConversation(conversationId: string): Promise<void>;
  getConversation(conversationId: string): Promise<Conversation>;
  
  // Messages
  sendMessage(conversationId: string, content: string): Promise<Message>;
  getMessages(conversationId: string): Promise<Message[]>;
  
  // Files
  getFiles(conversationId: string): Promise<Array<{ path: string; type: 'file' | 'directory' }>>;
  getFileContent(conversationId: string, filePath: string): Promise<{ content: string; language?: string }>;
  
  // Terminal
  executeCommand(conversationId: string, command: string): Promise<{ output: string; exitCode: number }>;
  getTerminalHistory(conversationId: string): Promise<Array<{ command: string; output: string; timestamp: Date }>>;
  
  // Git
  getGitStatus(conversationId: string): Promise<{
    status: string;
    files: Array<{ path: string; status: 'modified' | 'added' | 'deleted' | 'untracked' }>;
  }>;
  
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
