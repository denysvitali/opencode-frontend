/* eslint-disable @typescript-eslint/no-unused-vars */
import type { DataService } from './dataService.js';
import type { Conversation, Message, Workspace, Session } from '../types/index.js';
import { apiService } from './apiService.js';

/**
 * Real data service that communicates with the actual orchestrator API
 * This implements the DataService interface using the ApiIntegrationService
 */
export class RealDataService implements DataService {
  configure(options: { userId?: string } = {}): void {
    apiService.configure(options.userId);
  }

  getCurrentEndpoint(): string {
    return apiService.getCurrentEndpoint();
  }

  async checkHealth(): Promise<{ status: 'connected' | 'disconnected'; version?: string; error?: string }> {
    const result = await apiService.checkHealth();
    return {
      status: result.status === 'connected' || result.status === 'disconnected' ? result.status : 'disconnected',
      version: result.version,
      error: result.error
    };
  }

  // Workspace methods
  async loadWorkspaces(): Promise<Workspace[]> {
    return apiService.loadWorkspaces();
  }

  async createWorkspace(name: string, repositoryUrl?: string): Promise<Workspace> {
    return apiService.createWorkspace(name, repositoryUrl);
  }

  async deleteWorkspace(workspaceId: string): Promise<void> {
    return apiService.deleteWorkspace(workspaceId);
  }

  async getWorkspace(workspaceId: string): Promise<Workspace> {
    return apiService.getWorkspace(workspaceId);
  }

  // Session methods
  async loadSessions(workspaceId: string): Promise<Session[]> {
    return apiService.loadSessions(workspaceId);
  }

  async createSession(workspaceId: string, name: string): Promise<Session> {
    return apiService.createSession(workspaceId, name);
  }

  async deleteSession(workspaceId: string, sessionId: string): Promise<void> {
    return apiService.deleteSession(workspaceId, sessionId);
  }

  async getSession(workspaceId: string, sessionId: string): Promise<Session> {
    return apiService.getSession(workspaceId, sessionId);
  }

  // Message methods
  async sendMessage(workspaceId: string, sessionId: string, content: string): Promise<Message> {
    // For now, we'll create a user message and send it via the proxy
    // In a real implementation, this would send to the AI agent and return the response
    await apiService.sendMessage(`${workspaceId}`, content);
    
    // Return the user message that was sent
    return {
      id: Date.now().toString(),
      sessionId,
      type: 'user',
      content,
      status: 'sent',
      timestamp: new Date(),
    };
  }

  async getMessages(_workspaceId: string, _sessionId: string): Promise<Message[]> {
    // This would need to be implemented based on how messages are stored/retrieved
    // For now, return empty array as the API doesn't have a direct messages endpoint
    return [];
  }

  // File methods
  async getFiles(workspaceId: string, _sessionId: string): Promise<Array<{ path: string; type: 'file' | 'directory' }>> {
    const response = await apiService.getFiles(`${workspaceId}`);
    // Convert API response to expected format
    return response.body ? JSON.parse(response.body) : [];
  }

  async getFileContent(workspaceId: string, _sessionId: string, filePath: string): Promise<{ content: string; language?: string }> {
    const response = await apiService.getFileContent(`${workspaceId}`, filePath);
    return {
      content: response.body || '',
      language: this.getLanguageFromPath(filePath)
    };
  }

  // Terminal methods
  async executeCommand(workspaceId: string, _sessionId: string, command: string): Promise<{ output: string; exitCode: number }> {
    const response = await apiService.executeCommand(`${workspaceId}`, command);
    const result = response.body ? JSON.parse(response.body) : { output: '', exitCode: 1 };
    return {
      output: result.output || '',
      exitCode: result.exitCode || 0
    };
  }

  async getTerminalHistory(_workspaceId: string, _sessionId: string): Promise<Array<{ command: string; output: string; timestamp: Date }>> {
    // This would need to be implemented based on API capabilities
    return [];
  }

  // Git methods
  async getGitStatus(workspaceId: string, _sessionId: string): Promise<{
    status: string;
    files: Array<{ path: string; status: 'modified' | 'added' | 'deleted' | 'untracked' }>;
  }> {
    const response = await apiService.getGitStatus(`${workspaceId}`);
    const result = response.body ? JSON.parse(response.body) : { status: 'clean', files: [] };
    return {
      status: result.status || 'clean',
      files: result.files || []
    };
  }

  // Legacy methods for backward compatibility
  async loadConversations(): Promise<Conversation[]> {
    return apiService.loadConversations();
  }

  async createConversation(title: string, repositoryUrl?: string): Promise<Conversation> {
    return apiService.createConversation(title, repositoryUrl);
  }

  async deleteConversation(conversationId: string): Promise<void> {
    return apiService.deleteConversation(conversationId);
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    return apiService.getConversation(conversationId);
  }

  // Helper method to determine file language
  private getLanguageFromPath(filePath: string): string | undefined {
    const extension = filePath.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'jsx': 'javascript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'md': 'markdown',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'xml': 'xml',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less'
    };
    return extension ? languageMap[extension] : undefined;
  }
}
