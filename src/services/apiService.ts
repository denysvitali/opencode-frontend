import { orchestratorService } from './orchestratorService.js';
import { sessionsToConversations, sessionToConversation } from './orchestratorAdapter.js';
import { useSettingsStore } from '../stores/settingsStore.js';
import type { Conversation } from '../types/index.js';

/**
 * Real API integration service that replaces mock data with actual orchestrator calls
 * 
 * This service bridges between the frontend app store and the orchestrator API
 */
export class ApiIntegrationService {
  private userId: string = 'default-user'; // TODO: Get from auth

  constructor() {
    // Subscribe to settings changes
    useSettingsStore.subscribe((state) => {
      console.log('API endpoint updated to:', state.apiEndpoint);
    });
  }

  /**
   * Configure the user ID (API endpoint is handled by settings store)
   */
  configure(userId?: string) {
    if (userId) this.userId = userId;
  }

  /**
   * Get the current API endpoint from settings
   */
  getCurrentEndpoint(): string {
    return useSettingsStore.getState().apiEndpoint;
  }

  /**
   * Check if the orchestrator service is healthy
   */
  async checkHealth() {
    try {
      const health = await orchestratorService.checkHealth();
      return {
        status: health.status === 'SERVING' ? 'connected' : 'disconnected',
        version: health.version,
        details: health.details,
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'disconnected' as const,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Load conversations from orchestrator sessions
   */
  async loadConversations(): Promise<Conversation[]> {
    try {
      const response = await orchestratorService.listSessions();
      return sessionsToConversations(response.sessions || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      throw error;
    }
  }

  /**
   * Create a new conversation (session)
   */
  async createConversation(title: string, repositoryUrl?: string): Promise<Conversation> {
    try {
      const request = {
        name: title,
        userId: this.userId,
        config: repositoryUrl ? {
          repository: {
            url: repositoryUrl,
            ref: 'main',
          },
        } : undefined,
        labels: {
          'created-by': 'opencode-frontend',
          'user-id':  this.userId 
        },
      };

      const response = await orchestratorService.createSession(request);
      if (!response.session) {
        throw new Error('Session creation failed: no session returned');
      }

      return sessionToConversation(response.session);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  }

  /**
   * Delete a conversation (session)
   */
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      await orchestratorService.deleteSession(conversationId);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      throw error;
    }
  }

  /**
   * Get a specific conversation (session)
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    try {
      const response = await orchestratorService.getSession(conversationId);
      if (!response.session) {
        throw new Error('Session not found');
      }

      return sessionToConversation(response.session);
    } catch (error) {
      console.error('Failed to get conversation:', error);
      throw error;
    }
  }

  /**
   * Proxy a request to a session's sandbox
   * This would be used for chat messages, file operations, etc.
   */
  async proxySandboxRequest(
    conversationId: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: Record<string, unknown>,
    headers?: Record<string, string>
  ) {
    try {
      const headerArray = headers 
        ? Object.entries(headers).map(([key, value]) => ({ key, value }))
        : [];

      const response = await orchestratorService.proxyHTTP(conversationId, {
        method,
        path,
        headers: headerArray,
        body: body ? JSON.stringify(body) : undefined,
        userId: this.userId,
      });

      return {
        statusCode: response.statusCode,
        body: response.body,
        headers: Array.isArray(response.headers) 
          ? response.headers.reduce((acc: Record<string, string>, h: { key: string; value: string }) => {
              if (h.key && h.value) acc[h.key] = h.value;
              return acc;
            }, {} as Record<string, string>)
          : undefined,
      };
    } catch (error) {
      console.error('Failed to proxy sandbox request:', error);
      throw error;
    }
  }

  /**
   * Send a chat message to a session's AI agent
   */
  async sendMessage(conversationId: string, message: string) {
    return this.proxySandboxRequest(
      conversationId,
      'POST',
      '/chat/messages',
      { content: message, type: 'user' }
    );
  }

  /**
   * Get file list from a session's sandbox
   */
  async getFiles(conversationId: string) {
    return this.proxySandboxRequest(conversationId, 'GET', '/files');
  }

  /**
   * Get file content from a session's sandbox
   */
  async getFileContent(conversationId: string, filePath: string) {
    return this.proxySandboxRequest(
      conversationId, 
      'GET', 
      `/files${filePath.startsWith('/') ? '' : '/'}${filePath}`
    );
  }

  /**
   * Execute a terminal command in a session's sandbox
   */
  async executeCommand(conversationId: string, command: string) {
    return this.proxySandboxRequest(
      conversationId,
      'POST',
      '/terminal/execute',
      { command }
    );
  }

  /**
   * Get git status from a session's sandbox
   */
  async getGitStatus(conversationId: string) {
    return this.proxySandboxRequest(conversationId, 'GET', '/git/status');
  }
}

// Export singleton instance
export const apiService = new ApiIntegrationService();
