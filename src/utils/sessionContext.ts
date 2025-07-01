// Session context preservation utilities
// Handles saving and restoring workspace/session state across browser refreshes

interface SessionContext {
  activeWorkspaceId: string | null;
  activeSessionId: string | null;
  lastAccessTime: number;
  workspaceHistory: string[]; // Recent workspace IDs
  sessionHistory: Record<string, string[]>; // Session IDs by workspace
}

interface NavigationState {
  currentView: 'workspaces' | 'workspace' | 'session';
  breadcrumbs: {
    workspaceName?: string;
    sessionName?: string;
  };
}

const STORAGE_KEYS = {
  SESSION_CONTEXT: 'opencode_session_context',
  NAVIGATION_STATE: 'opencode_navigation_state',
  WORKSPACE_PREFERENCES: 'opencode_workspace_preferences'
} as const;

// Maximum items to keep in history
const MAX_HISTORY_ITEMS = 10;
const CONTEXT_EXPIRY_HOURS = 24;

export class SessionContextManager {
  /**
   * Save current session context to localStorage
   */
  static saveContext(
    workspaceId: string | null, 
    sessionId: string | null,
    workspaceName?: string,
    sessionName?: string
  ): void {
    try {
      const existing = this.getContext();
      const now = Date.now();

      // Update workspace history
      const workspaceHistory = existing.workspaceHistory.filter(id => id !== workspaceId);
      if (workspaceId) {
        workspaceHistory.unshift(workspaceId);
      }

      // Update session history for this workspace
      const sessionHistory = { ...existing.sessionHistory };
      if (workspaceId && sessionId) {
        const workspaceSessions = (sessionHistory[workspaceId] || []).filter(id => id !== sessionId);
        workspaceSessions.unshift(sessionId);
        sessionHistory[workspaceId] = workspaceSessions.slice(0, MAX_HISTORY_ITEMS);
      }

      const context: SessionContext = {
        activeWorkspaceId: workspaceId,
        activeSessionId: sessionId,
        lastAccessTime: now,
        workspaceHistory: workspaceHistory.slice(0, MAX_HISTORY_ITEMS),
        sessionHistory
      };

      localStorage.setItem(STORAGE_KEYS.SESSION_CONTEXT, JSON.stringify(context));

      // Save navigation state for breadcrumbs
      if (workspaceName || sessionName) {
        const navigationState: NavigationState = {
          currentView: sessionId ? 'session' : workspaceId ? 'workspace' : 'workspaces',
          breadcrumbs: {
            workspaceName,
            sessionName
          }
        };
        localStorage.setItem(STORAGE_KEYS.NAVIGATION_STATE, JSON.stringify(navigationState));
      }
    } catch (error) {
      console.warn('Failed to save session context:', error);
    }
  }

  /**
   * Restore session context from localStorage
   */
  static getContext(): SessionContext {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSION_CONTEXT);
      if (!stored) {
        return this.getDefaultContext();
      }

      const context: SessionContext = JSON.parse(stored);
      
      // Check if context is expired
      const hoursAgo = (Date.now() - context.lastAccessTime) / (1000 * 60 * 60);
      if (hoursAgo > CONTEXT_EXPIRY_HOURS) {
        this.clearContext();
        return this.getDefaultContext();
      }

      return context;
    } catch (error) {
      console.warn('Failed to restore session context:', error);
      return this.getDefaultContext();
    }
  }

  /**
   * Get navigation state for breadcrumbs
   */
  static getNavigationState(): NavigationState | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NAVIGATION_STATE);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to restore navigation state:', error);
      return null;
    }
  }

  /**
   * Clear all stored context
   */
  static clearContext(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSION_CONTEXT);
      localStorage.removeItem(STORAGE_KEYS.NAVIGATION_STATE);
    } catch (error) {
      console.warn('Failed to clear session context:', error);
    }
  }

  /**
   * Get recently accessed workspaces
   */
  static getRecentWorkspaces(): string[] {
    const context = this.getContext();
    return context.workspaceHistory;
  }

  /**
   * Get recently accessed sessions for a workspace
   */
  static getRecentSessions(workspaceId: string): string[] {
    const context = this.getContext();
    return context.sessionHistory[workspaceId] || [];
  }

  /**
   * Check if we should restore a specific workspace/session
   */
  static shouldRestore(): boolean {
    const context = this.getContext();
    return context.activeWorkspaceId !== null;
  }

  /**
   * Get the workspace/session to restore
   */
  static getRestoreTarget(): { workspaceId: string | null; sessionId: string | null } {
    const context = this.getContext();
    return {
      workspaceId: context.activeWorkspaceId,
      sessionId: context.activeSessionId
    };
  }

  private static getDefaultContext(): SessionContext {
    return {
      activeWorkspaceId: null,
      activeSessionId: null,
      lastAccessTime: Date.now(),
      workspaceHistory: [],
      sessionHistory: {}
    };
  }
}

// Workspace-specific preferences
export interface WorkspacePreferences {
  autoSave: boolean;
  defaultView: 'files' | 'terminal' | 'git';
  terminalTheme: 'dark' | 'light';
  fontSize: number;
  sidebarCollapsed: boolean;
}

export class WorkspacePreferencesManager {
  /**
   * Save preferences for a specific workspace
   */
  static savePreferences(workspaceId: string, preferences: Partial<WorkspacePreferences>): void {
    try {
      const existing = this.getAllPreferences();
      existing[workspaceId] = { ...this.getDefaultPreferences(), ...existing[workspaceId], ...preferences };
      localStorage.setItem(STORAGE_KEYS.WORKSPACE_PREFERENCES, JSON.stringify(existing));
    } catch (error) {
      console.warn('Failed to save workspace preferences:', error);
    }
  }

  /**
   * Get preferences for a specific workspace
   */
  static getPreferences(workspaceId: string): WorkspacePreferences {
    try {
      const all = this.getAllPreferences();
      return { ...this.getDefaultPreferences(), ...all[workspaceId] };
    } catch (error) {
      console.warn('Failed to get workspace preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * Get all workspace preferences
   */
  static getAllPreferences(): Record<string, Partial<WorkspacePreferences>> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WORKSPACE_PREFERENCES);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to get all workspace preferences:', error);
      return {};
    }
  }

  /**
   * Clear preferences for a specific workspace
   */
  static clearPreferences(workspaceId: string): void {
    try {
      const existing = this.getAllPreferences();
      delete existing[workspaceId];
      localStorage.setItem(STORAGE_KEYS.WORKSPACE_PREFERENCES, JSON.stringify(existing));
    } catch (error) {
      console.warn('Failed to clear workspace preferences:', error);
    }
  }

  /**
   * Get default preferences
   */
  static getDefaultPreferences(): WorkspacePreferences {
    return {
      autoSave: true,
      defaultView: 'files',
      terminalTheme: 'dark',
      fontSize: 14,
      sidebarCollapsed: false
    };
  }
}

// React hook for session context management
export const useSessionContext = () => {
  const saveContext = (
    workspaceId: string | null, 
    sessionId: string | null,
    workspaceName?: string,
    sessionName?: string
  ) => {
    SessionContextManager.saveContext(workspaceId, sessionId, workspaceName, sessionName);
  };

  const getContext = () => SessionContextManager.getContext();
  
  const getNavigationState = () => SessionContextManager.getNavigationState();
  
  const clearContext = () => SessionContextManager.clearContext();
  
  const shouldRestore = () => SessionContextManager.shouldRestore();
  
  const getRestoreTarget = () => SessionContextManager.getRestoreTarget();
  
  const getRecentWorkspaces = () => SessionContextManager.getRecentWorkspaces();
  
  const getRecentSessions = (workspaceId: string) => 
    SessionContextManager.getRecentSessions(workspaceId);

  return {
    saveContext,
    getContext,
    getNavigationState,
    clearContext,
    shouldRestore,
    getRestoreTarget,
    getRecentWorkspaces,
    getRecentSessions
  };
};

// React hook for workspace preferences
export const useWorkspacePreferences = (workspaceId: string | null) => {
  const savePreferences = (preferences: Partial<WorkspacePreferences>) => {
    if (workspaceId) {
      WorkspacePreferencesManager.savePreferences(workspaceId, preferences);
    }
  };

  const getPreferences = (): WorkspacePreferences => {
    if (!workspaceId) {
      return WorkspacePreferencesManager.getDefaultPreferences();
    }
    return WorkspacePreferencesManager.getPreferences(workspaceId);
  };

  const clearPreferences = () => {
    if (workspaceId) {
      WorkspacePreferencesManager.clearPreferences(workspaceId);
    }
  };

  return {
    preferences: getPreferences(),
    savePreferences,
    clearPreferences
  };
};
