import type { DataService } from './dataService.js';
import type { Conversation, Message, Workspace, Session } from '../types/index.js';

/**
 * Real data service that communicates with the actual API
 * This is a stub implementation to fix build errors
 * Full implementation will be added later
 */
export class RealDataService implements DataService {
  configure(): void {
    // Stub implementation
  }

  getCurrentEndpoint(): string {
    return 'http://localhost:9091';
  }

  async checkHealth(): Promise<{ status: 'connected' | 'disconnected'; version?: string; error?: string }> {
    return { status: 'disconnected', error: 'Not implemented' };
  }

  // Workspace methods
  async loadWorkspaces(): Promise<Workspace[]> {
    return [];
  }

  async createWorkspace(_name: string, _repositoryUrl?: string): Promise<Workspace> {
    throw new Error('Not implemented');
  }

  async deleteWorkspace(_workspaceId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async getWorkspace(_workspaceId: string): Promise<Workspace> {
    throw new Error('Not implemented');
  }

  // Session methods
  async loadSessions(_workspaceId: string): Promise<Session[]> {
    return [];
  }

  async createSession(_workspaceId: string, _name: string): Promise<Session> {
    throw new Error('Not implemented');
  }

  async deleteSession(_workspaceId: string, _sessionId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async getSession(_workspaceId: string, _sessionId: string): Promise<Session> {
    throw new Error('Not implemented');
  }

  // Message methods
  async sendMessage(_workspaceId: string, _sessionId: string, _content: string): Promise<Message> {
    throw new Error('Not implemented');
  }

  async getMessages(_workspaceId: string, _sessionId: string): Promise<Message[]> {
    return [];
  }

  // File methods
  async getFiles(_workspaceId: string, _sessionId: string): Promise<Array<{ path: string; type: 'file' | 'directory' }>> {
    return [];
  }

  async getFileContent(_workspaceId: string, _sessionId: string, _filePath: string): Promise<{ content: string; language?: string }> {
    return { content: '' };
  }

  // Terminal methods
  async executeCommand(_workspaceId: string, _sessionId: string, _command: string): Promise<{ output: string; exitCode: number }> {
    return { output: '', exitCode: 1 };
  }

  async getTerminalHistory(_workspaceId: string, _sessionId: string): Promise<Array<{ command: string; output: string; timestamp: Date }>> {
    return [];
  }

  // Git methods
  async getGitStatus(_workspaceId: string, _sessionId: string): Promise<{
    status: string;
    files: Array<{ path: string; status: 'modified' | 'added' | 'deleted' | 'untracked' }>;
  }> {
    return { status: 'clean', files: [] };
  }

  // Legacy methods for backward compatibility
  async loadConversations(): Promise<Conversation[]> {
    return [];
  }

  async createConversation(_title: string, _repositoryUrl?: string): Promise<Conversation> {
    throw new Error('Not implemented');
  }

  async deleteConversation(_conversationId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async getConversation(_conversationId: string): Promise<Conversation> {
    throw new Error('Not implemented');
  }
}