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
   * List all sessions for the current user
   */
  async listSessions() {
    const { data, error } = await this.client.GET('/sessions');
    
    if (error) {
      throw new Error(`Failed to list sessions: ${error.message || 'Unknown error'}`);
    }
    
    return data;
  }

  /**
   * Create a new session
   */
  async createSession(request: {
    name: string;
    userId: string;
    config?: {
      repository?: {
        url: string;
        ref?: string;
      };
      environment?: Record<string, string>;
    };
    labels?: Record<string, string>;
  }) {
    const { data, error } = await this.client.POST('/sessions', {
      body: request,
    });
    
    if (error) {
      throw new Error(`Failed to create session: ${error.message || 'Unknown error'}`);
    }
    
    return data;
  }

  /**
   * Get a specific session by ID
   */
  async getSession(sessionId: string) {
    const { data, error } = await this.client.GET('/sessions/{session_id}', {
      params: {
        path: { sessionId: sessionId },
      },
    });
    
    if (error) {
      throw new Error(`Failed to get session: ${error.message || 'Unknown error'}`);
    }
    
    return data;
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string) {
    const { data, error } = await this.client.DELETE('/sessions/{session_id}', {
      params: {
        path: { sessionId: sessionId },
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
  async proxyHTTP(sessionId: string, request: {
    method: string;
    path: string;
    headers?: Array<{ key: string; value: string }>;
    body?: string;
    userId: string;
  }) {
    const { data, error } = await this.client.POST('/sessions/{session_id}/proxy', {
      params: {
        path: { sessionId: sessionId },
      },
      body: {
        sessionId,
        ...request,
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

export type OrchestratorSession = paths['/sessions']['get']['responses']['200']['content']['application/json']['sessions'][0];
export type CreateSessionRequest = paths['/sessions']['post']['requestBody']['content']['application/json'];
export type HealthResponse = paths['/health']['get']['responses']['200']['content']['application/json'];
