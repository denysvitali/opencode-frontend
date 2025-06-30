import type { 
  OrchestratorWorkspace, 
  OrchestratorSession 
} from './orchestratorService.js';
import type { Workspace, Session, Conversation } from '../types/index.js';

/**
 * Adapter functions to convert between orchestrator API types and frontend types
 */

/**
 * Convert orchestrator workspace to frontend workspace
 */
export function orchestratorWorkspaceToWorkspace(orchestratorWorkspace: OrchestratorWorkspace): Workspace {
  return {
    id: orchestratorWorkspace.id || '',
    name: orchestratorWorkspace.name || 'Unnamed Workspace',
    createdAt: orchestratorWorkspace.createdAt ? new Date(orchestratorWorkspace.createdAt * 1000) : new Date(),
    updatedAt: orchestratorWorkspace.updatedAt ? new Date(orchestratorWorkspace.updatedAt * 1000) : new Date(),
    status: mapWorkspaceStateToStatus(orchestratorWorkspace.status?.ready ? 'WORKSPACE_STATE_RUNNING' : 'WORKSPACE_STATE_STOPPED'),
    config: {
      repository: orchestratorWorkspace.config?.repository?.url ? {
        url: orchestratorWorkspace.config.repository.url,
        ref: orchestratorWorkspace.config.repository.ref,
      } : undefined,
      environment: orchestratorWorkspace.config?.environment,
      resources: orchestratorWorkspace.config?.resources,
    },
    labels: orchestratorWorkspace.labels,
    userId: orchestratorWorkspace.userId || '',
  };
}

/**
 * Convert array of orchestrator workspaces to frontend workspaces
 */
export function orchestratorWorkspacesToWorkspaces(orchestratorWorkspaces: OrchestratorWorkspace[]): Workspace[] {
  return orchestratorWorkspaces.map(orchestratorWorkspaceToWorkspace);
}

/**
 * Convert orchestrator session to frontend session
 */
export function orchestratorSessionToSession(orchestratorSession: OrchestratorSession): Session {
  return {
    id: orchestratorSession.id || '',
    name: orchestratorSession.name || 'Unnamed Session',
    workspaceId: orchestratorSession.workspaceId || '',
    createdAt: orchestratorSession.createdAt ? new Date(orchestratorSession.createdAt * 1000) : new Date(),
    updatedAt: orchestratorSession.updatedAt ? new Date(orchestratorSession.updatedAt * 1000) : new Date(),
    state: mapSessionStateToStatus(orchestratorSession.state),
    config: orchestratorSession.config,
    labels: orchestratorSession.labels,
    userId: orchestratorSession.userId || '',
  };
}

/**
 * Convert array of orchestrator sessions to frontend sessions
 */
export function orchestratorSessionsToSessions(orchestratorSessions: OrchestratorSession[]): Session[] {
  return orchestratorSessions.map(orchestratorSessionToSession);
}

/**
 * Map orchestrator workspace state to frontend status
 */
function mapWorkspaceStateToStatus(state?: string): 'running' | 'creating' | 'stopped' | 'error' {
  switch (state) {
    case 'WORKSPACE_STATE_RUNNING':
      return 'running';
    case 'WORKSPACE_STATE_CREATING':
      return 'creating';
    case 'WORKSPACE_STATE_STOPPED':
    case 'WORKSPACE_STATE_STOPPING':
      return 'stopped';
    case 'WORKSPACE_STATE_ERROR':
      return 'error';
    default:
      return 'stopped';
  }
}

/**
 * Map orchestrator session state to frontend status
 */
function mapSessionStateToStatus(state?: string): 'running' | 'creating' | 'stopped' | 'error' {
  switch (state) {
    case 'SESSION_STATE_RUNNING':
      return 'running';
    case 'SESSION_STATE_CREATING':
      return 'creating';
    case 'SESSION_STATE_STOPPED':
    case 'SESSION_STATE_STOPPING':
      return 'stopped';
    case 'SESSION_STATE_ERROR':
      return 'error';
    default:
      return 'stopped';
  }
}

/**
 * Get a display-friendly status message from session state
 */
export function getSessionStatusMessage(state?: string, ready?: boolean): string {
  if (ready) return 'Sandbox Ready';
  
  switch (state) {
    case 'SESSION_STATE_RUNNING':
      return 'Sandbox Running';
    case 'SESSION_STATE_CREATING':
      return 'Starting Sandbox...';
    case 'SESSION_STATE_ERROR':
      return 'Sandbox Error';
    case 'SESSION_STATE_STOPPED':
      return 'Sandbox Stopped';
    case 'SESSION_STATE_STOPPING':
      return 'Stopping Sandbox...';
    case 'SESSION_STATE_UNKNOWN':
    default:
      return 'Sandbox Status Unknown';
  }
}

/**
 * Extract repository information from workspace config
 * Repository is now configured at workspace level in the new API
 */
export function getRepositoryInfo(_session: OrchestratorSession, workspace?: OrchestratorWorkspace) {
  // Try workspace config first (new model)
  if (workspace?.config?.repository) {
    const repo = workspace.config.repository;
    if (repo.url) {
      // Extract owner/repo from GitHub URL
      const match = repo.url.match(/github\.com[/:]([\w-]+)\/([\w.-]+?)(?:\.git)?$/);
      if (match) {
        return {
          owner: match[1],
          name: match[2],
          url: repo.url,
          ref: repo.ref || 'main',
        };
      }
      
      return {
        url: repo.url,
        ref: repo.ref || 'main',
      };
    }
  }

  // No repository info available
  return null;
}

/**
 * Check if a session is ready for interaction
 */
export function isSessionReady(session: OrchestratorSession): boolean {
  return session.state === 'SESSION_STATE_RUNNING' && session.status?.ready === true;
}

/**
 * Get the session endpoint for a session (for proxying requests)
 */
export function getSessionEndpoint(session: OrchestratorSession): string | null {
  return session.status?.sessionEndpoint || null;
}


/**
 * Get a display-friendly status message from workspace state
 */
export function getWorkspaceStatusMessage(state?: string, ready?: boolean): string {
  if (ready) return 'Workspace Ready';
  
  switch (state) {
    case 'WORKSPACE_STATE_RUNNING':
      return 'Workspace Running';
    case 'WORKSPACE_STATE_CREATING':
      return 'Starting Workspace...';
    case 'WORKSPACE_STATE_ERROR':
      return 'Workspace Error';
    case 'WORKSPACE_STATE_STOPPED':
      return 'Workspace Stopped';
    case 'WORKSPACE_STATE_STOPPING':
      return 'Stopping Workspace...';
    case 'WORKSPACE_STATE_UNKNOWN':
    default:
      return 'Workspace Status Unknown';
  }
}

/**
 * Extract repository information from workspace config
 */
export function getWorkspaceRepositoryInfo(workspace: OrchestratorWorkspace) {
  const repo = workspace.config?.repository;
  if (!repo?.url) return null;
  
  // Extract owner/repo from GitHub URL
  const match = repo.url.match(/github\.com[/:]([\w-]+)\/([\w.-]+?)(?:\.git)?$/);
  if (match) {
    return {
      owner: match[1],
      name: match[2],
      url: repo.url,
      ref: repo.ref || 'main',
    };
  }
  
  return {
    url: repo.url,
    ref: repo.ref || 'main',
  };
}

/**
 * Check if a workspace is ready for interaction
 */
export function isWorkspaceReady(workspace: OrchestratorWorkspace): boolean {
  return workspace.state === 'WORKSPACE_STATE_RUNNING' && workspace.status?.ready === true;
}

/**
 * Get the internal endpoint for a workspace (for proxying requests)
 */
export function getWorkspaceEndpoint(workspace: OrchestratorWorkspace): string | null {
  return workspace.status?.internalEndpoint || null;
}

export function workspacesToConversations(workspaces: OrchestratorWorkspace[]): Conversation[] {
  return workspaces.map(workspace => ({
    id: workspace.id || '',
    title: workspace.name || 'Unnamed Workspace',
    createdAt: workspace.createdAt ? new Date(workspace.createdAt * 1000) : new Date(),
    updatedAt: workspace.updatedAt ? new Date(workspace.updatedAt * 1000) : new Date(),
    messages: [],
    workspaceId: workspace.id || '',
    sandboxStatus: mapWorkspaceStateToSandboxStatus(workspace.status?.ready),
  }));
}

export function sessionToConversation(session: OrchestratorSession): Conversation {
  return {
    id: session.id || '',
    title: session.name || 'Unnamed Session',
    createdAt: session.createdAt ? new Date(session.createdAt * 1000) : new Date(),
    updatedAt: session.updatedAt ? new Date(session.updatedAt * 1000) : new Date(),
    messages: [],
    workspaceId: session.workspaceId || '',
    sessionId: session.id,
    sandboxStatus: mapSessionStateToSandboxStatus(session.state),
  };
}

export function sessionsToConversations(sessions: OrchestratorSession[]): Conversation[] {
  return sessions.map(sessionToConversation);
}

function mapSessionStateToSandboxStatus(state?: string): 'connected' | 'connecting' | 'disconnected' | 'error' {
  switch (state) {
    case 'SESSION_STATE_RUNNING':
      return 'connected';
    case 'SESSION_STATE_CREATING':
      return 'connecting';
    case 'SESSION_STATE_ERROR':
      return 'error';
    case 'SESSION_STATE_STOPPED':
    case 'SESSION_STATE_STOPPING':
    default:
      return 'disconnected';
  }
}

function mapWorkspaceStateToSandboxStatus(ready?: boolean): 'connected' | 'connecting' | 'disconnected' | 'error' {
  return ready ? 'connected' : 'disconnected';
}
