import { orchestratorService } from './orchestratorService.js';
import { 
  orchestratorWorkspacesToWorkspaces,
  orchestratorWorkspaceToWorkspace,
  orchestratorSessionsToSessions,
  orchestratorSessionToSession,
  workspacesToConversations
} from './orchestratorAdapter.js';
import { useSettingsStore } from '../stores/settingsStore.js';
import type { Conversation, Workspace, Session } from '../types/index.js';

/**
 * Real API integration service that replaces mock data with actual orchestrator calls
 * 
 * This service bridges between the frontend app store and the orchestrator API.
 * In the new model, workspaces are the primary containers and sessions are created within them.
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
   * Load conversations from orchestrator workspaces and sessions
   * For now, we'll treat each workspace as a conversation container
   */
  async loadConversations(): Promise<Conversation[]> {
    try {
      const workspacesResponse = await orchestratorService.listWorkspaces(this.userId);
      const workspaces = workspacesResponse.workspaces || [];
      
      // Convert workspaces to conversations
      // Each workspace can contain multiple sessions, but for UI simplicity,
      // we'll show workspaces as conversations and manage sessions internally
      return workspacesToConversations(workspaces);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      throw error;
    }
  }

  /**
   * Create a new conversation (workspace with a default session)
   */
  async createConversation(title: string, repositoryUrl?: string): Promise<Conversation> {
    try {
      // Create workspace first
      const workspaceRequest = {
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
          'user-id': this.userId,
        },
      };

      const workspaceResponse = await orchestratorService.createWorkspace(workspaceRequest);
      if (!workspaceResponse.workspace?.id) {
        throw new Error('Workspace creation failed: no workspace returned');
      }

      const workspace = workspaceResponse.workspace;
      const workspaceId = workspace.id!; // We already checked it exists above

      // Create a default session within the workspace
      const sessionRequest: {
        name: string;
        userId: string;
        workspaceId: string;
        config?: {
          context?: string;
          environment?: Record<string, string>;
        };
        labels?: Record<string, string>;
      } = {
        name: `${title} - Session`,
        userId: this.userId,
        workspaceId: workspaceId,
        config: {
          context: 'Default session for interactive coding',
        },
        labels: {
          'session-type': 'default',
          'created-by': 'opencode-frontend',
          'user-id': this.userId,
        },
      };

      const sessionResponse = await orchestratorService.createSession(workspaceId, sessionRequest);
      if (!sessionResponse.session) {
        console.warn('Session creation failed, but workspace was created');
      }

      // Return conversation based on workspace (sessions are managed internally)
      const conversation: Conversation = {
        id: workspace.id!,
        title: workspace.name!,
        createdAt: workspace.createdAt ? new Date(workspace.createdAt * 1000) : new Date(),
        updatedAt: workspace.updatedAt ? new Date(workspace.updatedAt * 1000) : new Date(),
        messages: [],
        workspaceId: workspace.id!,
        sandboxStatus: 'disconnected',
      };
      if (sessionResponse.session) {
        conversation.sessionId = sessionResponse.session.id;
      }
      
      return conversation;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  }

  /**
   * Delete a conversation (workspace and all its sessions)
   */
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      // In the new model, conversationId corresponds to workspaceId
      await orchestratorService.deleteWorkspace(conversationId);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      throw error;
    }
  }

  /**
   * Get a specific conversation (workspace)
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    try {
      // In the new model, conversationId corresponds to workspaceId
      const workspaceResponse = await orchestratorService.getWorkspace(conversationId);
      if (!workspaceResponse.workspace) {
        throw new Error('Workspace not found');
      }

      const conversation: Conversation = {
        id: workspaceResponse.workspace.id || '',
        title: workspaceResponse.workspace.name || 'Unnamed Workspace',
        createdAt: workspaceResponse.workspace.createdAt ? new Date(workspaceResponse.workspace.createdAt * 1000) : new Date(),
        updatedAt: workspaceResponse.workspace.updatedAt ? new Date(workspaceResponse.workspace.updatedAt * 1000) : new Date(),
        messages: [],
        workspaceId: workspaceResponse.workspace.id || '',
        sandboxStatus: 'disconnected',
      };
      
      // Try to get the default session for this workspace
      try {
        const sessionsResponse = await orchestratorService.listSessions(conversationId);
        const sessions = sessionsResponse.sessions || [];
        const defaultSession = sessions.find(s => s.labels?.['session-type'] === 'default') || sessions[0];
        if (defaultSession) {
          conversation.sessionId = defaultSession.id;
        }
      } catch (error) {
        console.warn('Failed to get sessions for workspace:', error);
      }

      return conversation;
    } catch (error) {
      console.error('Failed to get conversation:', error);
      throw error;
    }
  }

  /**
   * Get or create a session for a conversation (workspace)
   * This ensures we have a session to proxy requests to
   */
  async ensureSessionForConversation(conversationId: string): Promise<string> {
    try {
      // First, try to get existing sessions
      const sessionsResponse = await orchestratorService.listSessions(conversationId);
      const sessions = sessionsResponse.sessions || [];
      
      // Look for default session or any ready session
      let session = sessions.find(s => s.labels?.['session-type'] === 'default' && s.state === 'SESSION_STATE_RUNNING');
      if (!session) {
        session = sessions.find(s => s.state === 'SESSION_STATE_RUNNING');
      }
      
      // If no suitable session exists, create one
      if (!session) {
        const sessionRequest = {
          name: `Auto Session - ${new Date().toISOString()}`,
          userId: this.userId,
          workspaceId: conversationId,
          config: {
            context: 'Auto-created session for API operations',
          },
          labels: {
            'session-type': 'auto',
            'created-by': 'opencode-frontend',
            'user-id': this.userId,
          },
        };

        const sessionResponse = await orchestratorService.createSession(conversationId, sessionRequest);
        if (!sessionResponse.session?.id) {
          throw new Error('Failed to create session for conversation');
        }
        session = sessionResponse.session;
      }

      if (!session.id) {
        throw new Error('Session has no ID');
      }

      return session.id;
    } catch (error) {
      console.error('Failed to ensure session for conversation:', error);
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
      // Ensure we have a session for this workspace
      const sessionId = await this.ensureSessionForConversation(conversationId);

      const response = await orchestratorService.proxyHTTP(conversationId, sessionId, {
        method,
        path,
        headers: headers || {},
        body: body ? JSON.stringify(body) : undefined,
        userId: this.userId,
        workspaceId: conversationId,
        sessionId,
      });

      return {
        statusCode: response.statusCode,
        body: response.body,
        headers: response.headers,
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

  /**
   * Load workspaces from orchestrator
   */
  async loadWorkspaces(): Promise<Workspace[]> {
    try {
      const workspacesResponse = await orchestratorService.listWorkspaces(this.userId);
      const workspaces = workspacesResponse.workspaces || [];
      return orchestratorWorkspacesToWorkspaces(workspaces);
    } catch (error) {
      console.error('Failed to load workspaces:', error);
      throw error;
    }
  }

  /**
   * Create a new workspace
   */
  async createWorkspace(name: string, repositoryUrl?: string): Promise<Workspace> {
    try {
      const workspaceRequest = {
        name,
        userId: this.userId,
        config: repositoryUrl ? {
          repository: {
            url: repositoryUrl,
            ref: 'main',
          },
        } : undefined,
        labels: {
          'created-by': 'opencode-frontend',
          'user-id': this.userId,
        },
      };

      const workspaceResponse = await orchestratorService.createWorkspace(workspaceRequest);
      if (!workspaceResponse.workspace?.id) {
        throw new Error('Workspace creation failed: no workspace returned');
      }

      return orchestratorWorkspaceToWorkspace(workspaceResponse.workspace);
    } catch (error) {
      console.error('Failed to create workspace:', error);
      throw error;
    }
  }

  /**
   * Delete a workspace
   */
  async deleteWorkspace(workspaceId: string): Promise<void> {
    try {
      await orchestratorService.deleteWorkspace(workspaceId);
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      throw error;
    }
  }

  /**
   * Get a specific workspace
   */
  async getWorkspace(workspaceId: string): Promise<Workspace> {
    try {
      const workspaceResponse = await orchestratorService.getWorkspace(workspaceId);
      if (!workspaceResponse.workspace) {
        throw new Error('Workspace not found');
      }
      return orchestratorWorkspaceToWorkspace(workspaceResponse.workspace);
    } catch (error) {
      console.error('Failed to get workspace:', error);
      throw error;
    }
  }

  /**
   * Load sessions for a workspace
   */
  async loadSessions(workspaceId: string): Promise<Session[]> {
    try {
      const sessionsResponse = await orchestratorService.listSessions(workspaceId);
      const sessions = sessionsResponse.sessions || [];
      return orchestratorSessionsToSessions(sessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      throw error;
    }
  }

  /**
   * Create a new session within a workspace
   */
  async createSession(workspaceId: string, name: string): Promise<Session> {
    try {
      const sessionRequest = {
        name,
        userId: this.userId,
        workspaceId,
        config: {
          context: 'Interactive coding session',
        },
        labels: {
          'session-type': 'user-created',
          'created-by': 'opencode-frontend',
          'user-id': this.userId,
        },
      };

      const sessionResponse = await orchestratorService.createSession(workspaceId, sessionRequest);
      if (!sessionResponse.session?.id) {
        throw new Error('Session creation failed: no session returned');
      }

      return orchestratorSessionToSession(sessionResponse.session);
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(workspaceId: string, sessionId: string): Promise<void> {
    try {
      await orchestratorService.deleteSession(workspaceId, sessionId);
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw error;
    }
  }

  /**
   * Get a specific session
   */
  async getSession(workspaceId: string, sessionId: string): Promise<Session> {
    try {
      const sessionResponse = await orchestratorService.getSession(workspaceId, sessionId);
      if (!sessionResponse.session) {
        throw new Error('Session not found');
      }
      return orchestratorSessionToSession(sessionResponse.session);
    } catch (error) {
      console.error('Failed to get session:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiIntegrationService();
