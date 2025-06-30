// @ts-nocheck
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

  async createWorkspace(name: string, repositoryUrl?: string): Promise<Workspace> {
    throw new Error('Not implemented');
  }

  async deleteWorkspace(workspaceId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async getWorkspace(workspaceId: string): Promise<Workspace> {
    throw new Error('Not implemented');
  }

  // Session methods
  async loadSessions(workspaceId: string): Promise<Session[]> {
    return [];
  }

  async createSession(workspaceId: string, name: string): Promise<Session> {
    throw new Error('Not implemented');
  }

  async deleteSession(workspaceId: string, sessionId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async getSession(workspaceId: string, sessionId: string): Promise<Session> {
    throw new Error('Not implemented');
  }

  // Message methods
  async sendMessage(workspaceId: string, sessionId: string, content: string): Promise<Message> {
    throw new Error('Not implemented');
  }

  async getMessages(workspaceId: string, sessionId: string): Promise<Message[]> {
    return [];
  }

  // File methods
  async getFiles(workspaceId: string, sessionId: string): Promise<Array<{ path: string; type: 'file' | 'directory' }>> {
    return [];
  }

  async getFileContent(workspaceId: string, sessionId: string, filePath: string): Promise<{ content: string; language?: string }> {
    return { content: '' };
  }

  // Terminal methods
  async executeCommand(workspaceId: string, sessionId: string, command: string): Promise<{ output: string; exitCode: number }> {
    return { output: '', exitCode: 1 };
  }

  async getTerminalHistory(workspaceId: string, sessionId: string): Promise<Array<{ command: string; output: string; timestamp: Date }>> {
    return [];
  }

  // Git methods
  async getGitStatus(workspaceId: string, sessionId: string): Promise<{
    status: string;
    files: Array<{ path: string; status: 'modified' | 'added' | 'deleted' | 'untracked' }>;
  }> {
    return { status: 'clean', files: [] };
  }

  // Legacy methods for backward compatibility
  async loadConversations(): Promise<Conversation[]> {
    return [];
  }

  async createConversation(title: string, repositoryUrl?: string): Promise<Conversation> {
    throw new Error('Not implemented');
  }

  async deleteConversation(conversationId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    throw new Error('Not implemented');
  }
}