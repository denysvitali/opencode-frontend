import type { Session, Workspace } from '../types/index.js';
import { apiService } from '../services/apiService.js';

/**
 * Session Lifecycle Manager
 * 
 * Handles automatic session creation, state monitoring, and lifecycle management
 * for workspaces and their sessions.
 */
export class SessionLifecycleManager {
  private sessionCheckers = new Map<string, NodeJS.Timeout>();
  private autoSessionCache = new Map<string, string>(); // workspaceId -> sessionId

  /**
   * Ensure a workspace has at least one active session
   * Creates a default session if none exists or all are stopped
   */
  async ensureActiveSession(workspace: Workspace): Promise<Session> {
    try {
      // Check if we have a cached auto session
      const cachedSessionId = this.autoSessionCache.get(workspace.id);
      if (cachedSessionId) {
        try {
          const session = await apiService.getSession(workspace.id, cachedSessionId);
          if (this.isSessionReady(session)) {
            return session;
          }
        } catch {
          // Session no longer exists, remove from cache
          this.autoSessionCache.delete(workspace.id);
        }
      }

      // Load existing sessions
      const sessions = await apiService.loadSessions(workspace.id);
      
      // Look for a ready session
      const readySession = sessions.find(s => this.isSessionReady(s));
      if (readySession) {
        this.autoSessionCache.set(workspace.id, readySession.id);
        return readySession;
      }

      // Look for a starting session
      const startingSession = sessions.find(s => s.state === 'creating');
      if (startingSession) {
        // Wait for it to be ready and monitor it
        this.monitorSessionStartup(workspace.id, startingSession.id);
        return startingSession;
      }

      // No active sessions, create a new one
      const newSession = await this.createAutoSession(workspace);
      this.autoSessionCache.set(workspace.id, newSession.id);
      this.monitorSessionStartup(workspace.id, newSession.id);
      
      return newSession;
    } catch (error) {
      console.error('Failed to ensure active session:', error);
      throw error;
    }
  }

  /**
   * Create an automatic session for a workspace
   */
  private async createAutoSession(workspace: Workspace): Promise<Session> {
    const sessionName = `Auto Session - ${new Date().toLocaleString()}`;
    const session = await apiService.createSession(workspace.id, sessionName);
    
    console.log(`Created auto session ${session.id} for workspace ${workspace.id}`);
    return session;
  }

  /**
   * Check if a session is ready for use
   */
  private isSessionReady(session: Session): boolean {
    return session.state === 'running';
  }

  /**
   * Monitor a session that's starting up
   */
  private monitorSessionStartup(workspaceId: string, sessionId: string) {
    // Clear any existing checker for this session
    const existingChecker = this.sessionCheckers.get(`${workspaceId}:${sessionId}`);
    if (existingChecker) {
      clearInterval(existingChecker);
    }

    let attempts = 0;
    const maxAttempts = 30; // 30 attempts = 5 minutes max wait time
    
    const checker = setInterval(async () => {
      attempts++;
      
      try {
        const session = await apiService.getSession(workspaceId, sessionId);
        
        if (this.isSessionReady(session)) {
          console.log(`Session ${sessionId} is now ready`);
          this.stopMonitoring(workspaceId, sessionId);
          return;
        }
        
        if (session.state === 'error') {
          console.error(`Session ${sessionId} failed to start`);
          this.stopMonitoring(workspaceId, sessionId);
          this.autoSessionCache.delete(workspaceId);
          return;
        }
        
        if (attempts >= maxAttempts) {
          console.warn(`Session ${sessionId} took too long to start, stopping monitoring`);
          this.stopMonitoring(workspaceId, sessionId);
          return;
        }
        
        console.log(`Session ${sessionId} still starting... (attempt ${attempts}/${maxAttempts})`);
      } catch (error) {
        console.error(`Error checking session ${sessionId} status:`, error);
        this.stopMonitoring(workspaceId, sessionId);
        this.autoSessionCache.delete(workspaceId);
      }
    }, 10000); // Check every 10 seconds

    this.sessionCheckers.set(`${workspaceId}:${sessionId}`, checker);
  }

  /**
   * Stop monitoring a session
   */
  private stopMonitoring(workspaceId: string, sessionId: string) {
    const key = `${workspaceId}:${sessionId}`;
    const checker = this.sessionCheckers.get(key);
    if (checker) {
      clearInterval(checker);
      this.sessionCheckers.delete(key);
    }
  }

  /**
   * Get session health status
   */
  async getSessionHealth(workspaceId: string, sessionId: string): Promise<{
    ready: boolean;
    status: string;
    message: string;
  }> {
    try {
      const session = await apiService.getSession(workspaceId, sessionId);
      
      return {
        ready: this.isSessionReady(session),
        status: session.state,
        message: this.getSessionStatusMessage(session.state)
      };
    } catch (error) {
      return {
        ready: false,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get human-readable status message
   */
  private getSessionStatusMessage(state: string): string {
    switch (state) {
      case 'running':
        return 'Session is ready and active';
      case 'creating':
        return 'Session is starting up...';
      case 'stopped':
        return 'Session is stopped';
      case 'error':
        return 'Session encountered an error';
      default:
        return 'Session status unknown';
    }
  }

  /**
   * Clean up session for a workspace
   */
  cleanup(workspaceId: string) {
    // Remove from cache
    this.autoSessionCache.delete(workspaceId);
    
    // Stop all monitors for this workspace
    for (const [key, checker] of this.sessionCheckers.entries()) {
      if (key.startsWith(`${workspaceId}:`)) {
        clearInterval(checker);
        this.sessionCheckers.delete(key);
      }
    }
  }

  /**
   * Clean up all monitors
   */
  destroy() {
    for (const checker of this.sessionCheckers.values()) {
      clearInterval(checker);
    }
    this.sessionCheckers.clear();
    this.autoSessionCache.clear();
  }
}

// Singleton instance
export const sessionLifecycleManager = new SessionLifecycleManager();
