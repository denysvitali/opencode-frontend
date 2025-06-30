import type { DataService } from './dataService.js';
import type { Conversation, Message, Workspace, Session } from '../types/index.js';
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

  // Conversation methods
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

  // Messages with workspace/session context
  async sendMessage(workspaceId: string, sessionId: string, content: string): Promise<Message>;
  async sendMessage(conversationId: string, content: string): Promise<Message>;
  async sendMessage(workspaceIdOrConversationId: string, sessionIdOrContent: string, content?: string): Promise<Message> {
    // Handle both old (conversationId, content) and new (workspaceId, sessionId, content) signatures
    if (content === undefined) {
      // Old signature: (conversationId, content)
      const conversationId = workspaceIdOrConversationId;
      const messageContent = sessionIdOrContent;
      
      try {
        // Send message to sandbox via proxy (old way)
        await apiService.sendMessage(conversationId, messageContent);
        
        // Create message object from response
        return {
          id: `msg_${Date.now()}`,
          conversationId,
          type: 'user',
          content: messageContent,
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
    } else {
      // New signature: (workspaceId, sessionId, content)
      const workspaceId = workspaceIdOrConversationId;
      const sessionId = sessionIdOrContent;
      
      try {
        return await apiService.sendMessage(workspaceId, sessionId, content);
      } catch (error) {
        console.error('Failed to send message:', error);
        // Return error message
        return {
          id: `msg_${Date.now()}`,
          conversationId: sessionId, // Use sessionId as conversationId for compatibility
          type: 'system',
          content: `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
          status: 'error',
          timestamp: new Date(),
        };
      }
    }
  }

  // Messages with workspace/session context
  async getMessages(workspaceId: string, sessionId: string): Promise<Message[]>;
  async getMessages(conversationId: string): Promise<Message[]>;
  async getMessages(workspaceIdOrConversationId: string, sessionId?: string): Promise<Message[]> {
    try {
      if (sessionId === undefined) {
        // Old signature: (conversationId)
        const conversationId = workspaceIdOrConversationId;
        
        // Get messages from sandbox via proxy (old way)
        await apiService.proxySandboxRequest(
          conversationId,
          'GET',
          '/chat/messages'
        );
        
        // Transform response to our message format
        // This will depend on the actual sandbox API response format
        return []; // TODO: Implement based on actual sandbox response
      } else {
        // New signature: (workspaceId, sessionId)
        const workspaceId = workspaceIdOrConversationId;
        
        return await apiService.getMessages(workspaceId, sessionId);
      }
    } catch (error) {
      console.error('Failed to get messages:', error);
      return [];
    }
  }

  // Files with workspace/session context
  async getFiles(workspaceId: string, sessionId: string): Promise<Array<{ path: string; type: 'file' | 'directory' }>>;
  async getFiles(conversationId: string): Promise<Array<{ path: string; type: 'file' | 'directory' }>>;
  async getFiles(workspaceIdOrConversationId: string, sessionId?: string): Promise<Array<{ path: string; type: 'file' | 'directory' }>> {
    try {
      if (sessionId === undefined) {
        // Old signature: (conversationId)
        const conversationId = workspaceIdOrConversationId;
        
        await apiService.getFiles(conversationId);
        
        // Transform response to our file format
        // This will depend on the actual sandbox API response format
        return []; // TODO: Implement based on actual sandbox response
      } else {
        // New signature: (workspaceId, sessionId)
        const workspaceId = workspaceIdOrConversationId;
        
        return await apiService.getFiles(workspaceId, sessionId);
      }
    } catch (error) {
      console.error('Failed to get files:', error);
      return [];
    }
  }

  // File content with workspace/session context
  async getFileContent(workspaceId: string, sessionId: string, filePath: string): Promise<{ content: string; language?: string }>;
  async getFileContent(conversationId: string, filePath: string): Promise<{ content: string; language?: string }>;
  async getFileContent(workspaceIdOrConversationId: string, sessionIdOrFilePath: string, filePath?: string): Promise<{ content: string; language?: string }> {
    try {
      let actualFilePath: string;
      let response: Response;
      
      if (filePath === undefined) {
        // Old signature: (conversationId, filePath)
        const conversationId = workspaceIdOrConversationId;
        actualFilePath = sessionIdOrFilePath;
        
        response = await apiService.getFileContent(conversationId, actualFilePath);
      } else {
        // New signature: (workspaceId, sessionId, filePath)
        const workspaceId = workspaceIdOrConversationId;
        const sessionId = sessionIdOrFilePath;
        actualFilePath = filePath;
        
        response = await apiService.getFileContent(workspaceId, sessionId, actualFilePath);
      }
      
      // Determine language from file extension
      const extension = actualFilePath.split('.').pop()?.toLowerCase();
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
        content: response.body || response.content || '',
        language: extension ? languageMap[extension] : undefined,
      };
    } catch (error) {
      console.error('Failed to get file content:', error);
      return {
        content: `Error loading file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // Terminal commands with workspace/session context
  async executeCommand(workspaceId: string, sessionId: string, command: string): Promise<{ output: string; exitCode: number }>;
  async executeCommand(conversationId: string, command: string): Promise<{ output: string; exitCode: number }>;
  async executeCommand(workspaceIdOrConversationId: string, sessionIdOrCommand: string, command?: string): Promise<{ output: string; exitCode: number }> {
    try {
      let response: Response;
      
      if (command === undefined) {
        // Old signature: (conversationId, command)
        const conversationId = workspaceIdOrConversationId;
        const actualCommand = sessionIdOrCommand;
        
        response = await apiService.executeCommand(conversationId, actualCommand);
      } else {
        // New signature: (workspaceId, sessionId, command)
        const workspaceId = workspaceIdOrConversationId;
        const sessionId = sessionIdOrCommand;
        
        response = await apiService.executeCommand(workspaceId, sessionId, command);
      }
      
      return {
        output: response.body || response.output || '',
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

  // Terminal history with workspace/session context
  async getTerminalHistory(workspaceId: string, sessionId: string): Promise<Array<{ command: string; output: string; timestamp: Date }>>;
  async getTerminalHistory(conversationId: string): Promise<Array<{ command: string; output: string; timestamp: Date }>>;
  async getTerminalHistory(workspaceIdOrConversationId: string, sessionId?: string): Promise<Array<{ command: string; output: string; timestamp: Date }>> {
    try {
      if (sessionId === undefined) {
        // Old signature: (conversationId)
        const conversationId = workspaceIdOrConversationId;
        
        await apiService.proxySandboxRequest(
          conversationId,
          'GET',
          '/terminal/history'
        );
        
        // Transform response to our history format
        // This will depend on the actual sandbox API response format
        return []; // TODO: Implement based on actual sandbox response
      } else {
        // New signature: (workspaceId, sessionId)
        const workspaceId = workspaceIdOrConversationId;
        
        return await apiService.getTerminalHistory(workspaceId, sessionId);
      }
    } catch (error) {
      console.error('Failed to get terminal history:', error);
      return [];
    }
  }

  // Git status with workspace/session context
  async getGitStatus(workspaceId: string, sessionId: string): Promise<{
    status: string;
    files: Array<{ path: string; status: 'modified' | 'added' | 'deleted' | 'untracked' }>;
  }>;
  async getGitStatus(conversationId: string): Promise<{
    status: string;
    files: Array<{ path: string; status: 'modified' | 'added' | 'deleted' | 'untracked' }>;
  }>;
  async getGitStatus(workspaceIdOrConversationId: string, sessionId?: string): Promise<{
    status: string;
    files: Array<{ path: string; status: 'modified' | 'added' | 'deleted' | 'untracked' }>;
  }> {
    try {
      if (sessionId === undefined) {
        // Old signature: (conversationId)
        const conversationId = workspaceIdOrConversationId;
        
        await apiService.getGitStatus(conversationId);
        
        // Transform response to our git status format
        // This will depend on the actual sandbox API response format
        return {
          status: 'clean',
          files: [],
        }; // TODO: Implement based on actual sandbox response
      } else {
        // New signature: (workspaceId, sessionId)
        const workspaceId = workspaceIdOrConversationId;
        
        return await apiService.getGitStatus(workspaceId, sessionId);
      }
    } catch (error) {
      console.error('Failed to get git status:', error);
      return {
        status: 'error',
        files: [],
      };
    }
  }

  // Workspace methods
  async loadWorkspaces(): Promise<Workspace[]> {
    try {
      return await apiService.loadWorkspaces();
    } catch (error) {
      console.error('Failed to load workspaces:', error);
      return []; // Return empty array on error for graceful degradation
    }
  }

  async createWorkspace(name: string, repositoryUrl?: string): Promise<Workspace> {
    return await apiService.createWorkspace(name, repositoryUrl);
  }

  async deleteWorkspace(workspaceId: string): Promise<void> {
    await apiService.deleteWorkspace(workspaceId);
  }

  async getWorkspace(workspaceId: string): Promise<Workspace> {
    return await apiService.getWorkspace(workspaceId);
  }

  // Session methods
  async loadSessions(workspaceId: string): Promise<Session[]> {
    try {
      return await apiService.loadSessions(workspaceId);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      return []; // Return empty array on error for graceful degradation
    }
  }

  async createSession(workspaceId: string, name: string): Promise<Session> {
    return await apiService.createSession(workspaceId, name);
  }

  async deleteSession(workspaceId: string, sessionId: string): Promise<void> {
    await apiService.deleteSession(workspaceId, sessionId);
  }

  async getSession(workspaceId: string, sessionId: string): Promise<Session> {
    return await apiService.getSession(workspaceId, sessionId);
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
