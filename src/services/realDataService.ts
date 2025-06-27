import type { DataService } from './dataService.js';
import type { Conversation, Message } from '../types/index.js';
import { apiService } from './apiService.js';

/**
 * Real data service that uses the orchestrator API
 */
export class RealDataService implements DataService {
  private userId: string = 'default-user'; // TODO: Get from auth

  constructor() {
    // Configure the API service
    apiService.configure(this.userId);
  }

  async checkHealth() {
    try {
      const health = await apiService.checkHealth();
      return {
        status: health.status as 'connected' | 'disconnected',
        version: health.version,
        error: health.error,
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'disconnected' as const,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async loadConversations(): Promise<Conversation[]> {
    try {
      return await apiService.loadConversations();
    } catch (error) {
      console.error('Failed to load conversations:', error);
      return []; // Return empty array on error for graceful degradation
    }
  }

  async createConversation(title: string, repositoryUrl?: string): Promise<Conversation> {
    return await apiService.createConversation(title, repositoryUrl);
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await apiService.deleteConversation(conversationId);
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    return await apiService.getConversation(conversationId);
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    try {
      // Send message to sandbox via proxy
      await apiService.sendMessage(conversationId, content);
      
      // Create message object from response
      return {
        id: `msg_${Date.now()}`,
        conversationId,
        type: 'user',
        content,
        status: 'sent',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Failed to send message:', error);
      // Return error message
      return {
        id: `msg_${Date.now()}`,
        conversationId,
        type: 'system',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
        status: 'error',
        timestamp: new Date(),
      };
    }
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      // Get messages from sandbox via proxy
      await apiService.proxySandboxRequest(
        conversationId,
        'GET',
        '/chat/messages'
      );
      
      // Transform response to our message format
      // This will depend on the actual sandbox API response format
      return []; // TODO: Implement based on actual sandbox response
    } catch (error) {
      console.error('Failed to get messages:', error);
      return [];
    }
  }

  async getFiles(conversationId: string): Promise<Array<{ path: string; type: 'file' | 'directory' }>> {
    try {
      await apiService.getFiles(conversationId);
      
      // Transform response to our file format
      // This will depend on the actual sandbox API response format
      return []; // TODO: Implement based on actual sandbox response
    } catch (error) {
      console.error('Failed to get files:', error);
      return [];
    }
  }

  async getFileContent(conversationId: string, filePath: string): Promise<{ content: string; language?: string }> {
    try {
      const response = await apiService.getFileContent(conversationId, filePath);
      
      // Determine language from file extension
      const extension = filePath.split('.').pop()?.toLowerCase();
      const languageMap: Record<string, string> = {
        'ts': 'typescript',
        'tsx': 'typescript',
        'js': 'javascript',
        'jsx': 'javascript',
        'py': 'python',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'css': 'css',
        'html': 'html',
        'json': 'json',
        'md': 'markdown',
        'yml': 'yaml',
        'yaml': 'yaml',
      };
      
      return {
        content: response.body || '',
        language: extension ? languageMap[extension] : undefined,
      };
    } catch (error) {
      console.error('Failed to get file content:', error);
      return {
        content: `Error loading file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async executeCommand(conversationId: string, command: string): Promise<{ output: string; exitCode: number }> {
    try {
      const response = await apiService.executeCommand(conversationId, command);
      
      return {
        output: response.body || '',
        exitCode: response.statusCode === 200 ? 0 : 1,
      };
    } catch (error) {
      console.error('Failed to execute command:', error);
      return {
        output: `Error: ${error instanceof Error ? error.message : 'Command execution failed'}`,
        exitCode: 1,
      };
    }
  }

  async getTerminalHistory(conversationId: string): Promise<Array<{ command: string; output: string; timestamp: Date }>> {
    try {
      await apiService.proxySandboxRequest(
        conversationId,
        'GET',
        '/terminal/history'
      );
      
      // Transform response to our history format
      // This will depend on the actual sandbox API response format
      return []; // TODO: Implement based on actual sandbox response
    } catch (error) {
      console.error('Failed to get terminal history:', error);
      return [];
    }
  }

  async getGitStatus(conversationId: string): Promise<{
    status: string;
    files: Array<{ path: string; status: 'modified' | 'added' | 'deleted' | 'untracked' }>;
  }> {
    try {
      await apiService.getGitStatus(conversationId);
      
      // Transform response to our git status format
      // This will depend on the actual sandbox API response format
      return {
        status: 'clean',
        files: [],
      }; // TODO: Implement based on actual sandbox response
    } catch (error) {
      console.error('Failed to get git status:', error);
      return {
        status: 'error',
        files: [],
      };
    }
  }

  getCurrentEndpoint(): string {
    return apiService.getCurrentEndpoint();
  }

  configure(options: { userId?: string }): void {
    if (options.userId) {
      this.userId = options.userId;
      apiService.configure(options.userId);
    }
  }
}
