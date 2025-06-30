import createClient from 'openapi-fetch';
import type { paths } from '../types/orchestrator.js';
import { useSettingsStore } from '../stores/settingsStore.js';

/**
 * OpenCode Orchestrator API Client
 * 
 * This service provides type-safe access to the OpenCode orchestrator API
 * using auto-generated types from the OpenAPI schema.
 */
class OrchestratorService {
  private client: ReturnType<typeof createClient<paths>>;

  constructor() {
    // Initialize with default, will be updated when settings are loaded
    const settings = useSettingsStore.getState();
    this.client = createClient<paths>({ 
      baseUrl: settings.apiEndpoint,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Subscribe to settings changes to update the client
    useSettingsStore.subscribe((state) => {
      this.updateBaseUrl(state.apiEndpoint);
    });
  }

  /**
   * Update the base URL for the orchestrator API
   */
  updateBaseUrl(baseUrl: string) {
    this.client = createClient<paths>({ 
      baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get the current API endpoint
   */
  getCurrentEndpoint(): string {
    return useSettingsStore.getState().apiEndpoint;
  }

  /**
   * Check the health of the orchestrator service
   */
  async checkHealth() {
    const { data, error } = await this.client.GET('/health');
    
    if (error) {
      throw new Error(`Health check failed: ${error.message || 'Unknown error'}`);
    }
    
    return data;
  }

  /**
   * List all workspaces for the current user
   * Note: Backend requires user_id query param but OpenAPI spec doesn't define it
   */
  async listWorkspaces(userId?: string) {
    try {
      const baseUrl = useSettingsStore.getState().apiEndpoint;
      const url = new URL('/workspaces', baseUrl);
      if (userId) {
        url.searchParams.set('user_id', userId);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to list workspaces: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new workspace
   */
  async createWorkspace(request: {
    name: string;
    userId: string;
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
  }) {
    const { data, error } = await this.client.POST('/workspaces', {
      body: request,
    });
    
    if (error) {
      throw new Error(`Failed to create workspace: ${error.message || 'Unknown error'}`);
    }
    
    return data;
  }

  /**
   * Get a specific workspace by ID
   */
  async getWorkspace(workspaceId: string) {
    const { data, error } = await this.client.GET('/workspaces/{workspace_id}', {
      params: {
        path: { workspaceId },
      },
    });
    
    if (error) {
      throw new Error(`Failed to get workspace: ${error.message || 'Unknown error'}`);
    }
    
    return data;
  }

  /**
   * Delete a workspace
   */
  async deleteWorkspace(workspaceId: string) {
    const { data, error } = await this.client.DELETE('/workspaces/{workspace_id}', {
      params: {
        path: { workspaceId },
      },
    });
    
    if (error) {
      throw new Error(`Failed to delete workspace: ${error.message || 'Unknown error'}`);
    }
    
    return data;
  }

  /**
   * List all sessions in a workspace
   */
  async listSessions(workspaceId: string) {
    const { data, error } = await this.client.GET('/workspaces/{workspace_id}/sessions', {
      params: {
        path: { workspaceId },
      },
    });
    
    if (error) {
      throw new Error(`Failed to list sessions: ${error.message || 'Unknown error'}`);
    }
    
    return data;
  }

  /**
   * Create a new session within a workspace
   */
  async createSession(workspaceId: string, request: {
    name: string;
    userId: string;
    workspaceId: string;
    config?: {
      context?: string;
      environment?: Record<string, string>;
    };
    labels?: Record<string, string>;
  }) {
    const { data, error } = await this.client.POST('/workspaces/{workspace_id}/sessions', {
      params: {
        path: { workspaceId },
      },
      body: {
        ...request,
        workspaceId, // Ensure workspaceId is set
      },
    });
    
    if (error) {
      throw new Error(`Failed to create session: ${error.message || 'Unknown error'}`);
    }
    
    return data;
  }

  /**
   * Get a specific session by ID within a workspace
   */
  async getSession(workspaceId: string, sessionId: string) {
    const { data, error } = await this.client.GET('/workspaces/{workspace_id}/sessions/{session_id}', {
      params: {
        path: { 
          workspaceId,
          sessionId,
        },
      },
    });
    
    if (error) {
      throw new Error(`Failed to get session: ${error.message || 'Unknown error'}`);
    }
    
    return data;
  }

  /**
   * Delete a session within a workspace
   */
  async deleteSession(workspaceId: string, sessionId: string) {
    const { data, error } = await this.client.DELETE('/workspaces/{workspace_id}/sessions/{session_id}', {
      params: {
        path: { 
          workspaceId,
          sessionId,
        },
      },
    });
    
    if (error) {
      throw new Error(`Failed to delete session: ${error.message || 'Unknown error'}`);
    }
    
    return data;
  }

  /**
   * Proxy an HTTP request to a session's sandbox
   */
  async proxyHTTP(workspaceId: string, sessionId: string, request: {
    method: string;
    path: string;
    headers?: Record<string, string>;
    body?: string;
    userId: string;
    workspaceId: string;
    sessionId: string;
  }) {
    const { data, error } = await this.client.POST('/workspaces/{workspace_id}/sessions/{session_id}/proxy', {
      params: {
        path: { 
          workspaceId,
          sessionId,
        },
      },
      body: {
        ...request,
        workspaceId,
        sessionId,
      },
    });
    
    if (error) {
      throw new Error(`Failed to proxy HTTP request: ${error.message || 'Unknown error'}`);
    }
    
    return data;
  }

  /**
   * Map orchestrator session state to frontend sandbox status
   */
  mapSessionStateToSandboxStatus(state?: string): 'connected' | 'connecting' | 'error' | 'disconnected' {
    switch (state) {
      case 'SESSION_STATE_RUNNING':
        return 'connected';
      case 'SESSION_STATE_CREATING':
        return 'connecting';
      case 'SESSION_STATE_ERROR':
        return 'error';
      case 'SESSION_STATE_STOPPED':
      case 'SESSION_STATE_STOPPING':
      case 'SESSION_STATE_UNKNOWN':
      default:
        return 'disconnected';
    }
  }
}

// Create a singleton instance
export const orchestratorService = new OrchestratorService();

// Export the class for testing or custom instances
export { OrchestratorService };

// Export types for convenience
export type {
  paths as OrchestratorPaths,
} from '../types/orchestrator.js';

export type OrchestratorWorkspace = NonNullable<paths['/workspaces']['get']['responses']['200']['content']['application/json']['workspaces']>[number];
export type OrchestratorSession = NonNullable<paths['/workspaces/{workspace_id}/sessions']['get']['responses']['200']['content']['application/json']['sessions']>[number];
export type CreateWorkspaceRequest = paths['/workspaces']['post']['requestBody']['content']['application/json'];
export type CreateSessionRequest = paths['/workspaces/{workspace_id}/sessions']['post']['requestBody']['content']['application/json'];
export type HealthResponse = paths['/health']['get']['responses']['200']['content']['application/json'];
