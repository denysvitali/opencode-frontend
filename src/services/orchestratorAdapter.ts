import type { Conversation } from '../types/index.js';
import type { OrchestratorSession } from './orchestratorService.js';

/**
 * Utility functions to convert between orchestrator API types and frontend types
 */

/**
 * Convert an orchestrator session to a frontend conversation
 */
export function sessionToConversation(session: OrchestratorSession): Conversation {
  const sandboxStatus = mapSessionStateToSandboxStatus(session.state);
  
  return {
    id: session.id ? session.id.slice(0, 8) : '',
    title: session.name || `Session ${session.id?.slice(0, 8) || 'Unknown'}`,
    createdAt: session.createdAt ? new Date(session.createdAt * 1000) : new Date(),
    updatedAt: session.updatedAt ? new Date(session.updatedAt * 1000) : new Date(),
    messages: [], // Messages would be loaded separately via sandbox proxy
    sandboxStatus,
  };
}

/**
 * Convert multiple orchestrator sessions to frontend conversations
 */
export function sessionsToConversations(sessions: OrchestratorSession[]): Conversation[] {
  return sessions.map(sessionToConversation);
}

/**
 * Map orchestrator session state to frontend sandbox status
 */
export function mapSessionStateToSandboxStatus(
  state?: string
): 'connected' | 'connecting' | 'error' | 'disconnected' {
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
 * Extract repository information from session config
 */
export function getRepositoryInfo(session: OrchestratorSession) {
  const repo = session.config?.repository;
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
 * Check if a session is ready for interaction
 */
export function isSessionReady(session: OrchestratorSession): boolean {
  return session.state === 'SESSION_STATE_RUNNING' && session.status?.ready === true;
}

/**
 * Get the internal endpoint for a session (for proxying requests)
 */
export function getSessionEndpoint(session: OrchestratorSession): string | null {
  return session.status?.internalEndpoint || null;
}
