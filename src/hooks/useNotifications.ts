import { useState, useEffect, useCallback } from 'react';
import type { NotificationSettings } from '../services/notificationService.js';
import { notificationService } from '../services/notificationService.js';
import type { ActivityNotification, WorkspaceStatusUpdate } from '../services/websocketService.js';
import { websocketService } from '../services/websocketService.js';
import { useAppStore } from '../stores/appStore.js';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { activeWorkspace: currentWorkspace, activeSession: currentSession } = useAppStore();

  // Handle WebSocket activity notifications
  const handleActivityNotification = useCallback((notification: ActivityNotification) => {
    // Map WebSocket notification to our notification service
    notificationService.notify({
      title: notification.title,
      message: notification.message,
      type: notification.type.includes('workspace') ? 'workspace' : 'session',
      severity: notification.severity,
      workspaceId: notification.workspaceId,
      sessionId: notification.sessionId,
      autoClose: notification.autoClose
    });
  }, []);

  // Handle workspace status updates
  const handleWorkspaceStatusUpdate = useCallback((update: WorkspaceStatusUpdate) => {
    const { workspaceId, status, message, progress } = update;
    
    let title = 'Workspace Status Update';
    let notificationMessage = message || `Workspace status changed to ${status}`;
    let severity: 'info' | 'success' | 'warning' | 'error' = 'info';

    switch (status) {
      case 'running':
        title = 'Workspace Started';
        notificationMessage = message || 'Your workspace is now running and ready to use';
        severity = 'success';
        break;
      case 'creating':
        title = 'Creating Workspace';
        notificationMessage = message || `Creating workspace... ${progress ? `${progress}%` : ''}`;
        severity = 'info';
        break;
      case 'stopped':
        title = 'Workspace Stopped';
        notificationMessage = message || 'Your workspace has been stopped';
        severity = 'warning';
        break;
      case 'error':
        title = 'Workspace Error';
        notificationMessage = message || 'An error occurred with your workspace';
        severity = 'error';
        break;
    }

    notificationService.notifyWorkspaceEvent(
      title,
      notificationMessage,
      workspaceId,
      severity
    );
  }, []);

  // Set up WebSocket event handlers
  useEffect(() => {
    const handlers = {
      onActivityNotification: handleActivityNotification,
      onWorkspaceStatusUpdate: handleWorkspaceStatusUpdate,
      
      onConnected: () => {
        notificationService.notifySystemEvent(
          'Connected',
          'Real-time connection established',
          'success'
        );
      },
      
      onDisconnected: () => {
        notificationService.notifySystemEvent(
          'Disconnected',
          'Real-time connection lost. Attempting to reconnect...',
          'warning'
        );
      },
      
      onReconnected: () => {
        notificationService.notifySystemEvent(
          'Reconnected',
          'Real-time connection restored',
          'success'
        );
      },
      
      onError: () => {
        notificationService.notifySystemEvent(
          'Connection Error',
          'Failed to establish real-time connection',
          'error'
        );
      }
    };

    websocketService.updateHandlers(handlers);

    return () => {
      // In a real implementation, we'd need a way to remove specific handlers
      // For now, we rely on component unmounting
    };
  }, [handleActivityNotification, handleWorkspaceStatusUpdate]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
    };
    
    setNotifications(prev => [...prev, newNotification]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Convenience methods
  const showSuccess = (title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ ...options, type: 'success', title, message });
  };

  const showError = (title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ ...options, type: 'error', title, message, persistent: true });
  };

  const showWarning = (title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ ...options, type: 'warning', title, message });
  };

  const showInfo = (title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ ...options, type: 'info', title, message });
  };

  // Request notification permission on first use
  const requestPermission = useCallback(async () => {
    return await notificationService.requestNotificationPermission();
  }, []);

  // Get current notification settings
  const getSettings = useCallback((): NotificationSettings => {
    return notificationService.getSettings();
  }, []);

  // Update notification settings
  const updateSettings = useCallback((settings: Partial<NotificationSettings>) => {
    notificationService.updateSettings(settings);
  }, []);

  // Test notification functionality
  const testNotification = useCallback(() => {
    notificationService.testNotification();
  }, []);

  // Workspace-specific notifications
  const notifyWorkspaceCreated = useCallback((workspaceName: string, workspaceId: string) => {
    notificationService.notifyWorkspaceEvent(
      'Workspace Created',
      `Successfully created workspace "${workspaceName}"`,
      workspaceId,
      'success'
    );
  }, []);

  const notifyWorkspaceDeleted = useCallback((workspaceName: string, workspaceId: string) => {
    notificationService.notifyWorkspaceEvent(
      'Workspace Deleted',
      `Workspace "${workspaceName}" has been deleted`,
      workspaceId,
      'info'
    );
  }, []);

  const notifyWorkspaceError = useCallback((workspaceName: string, workspaceId: string, error: string) => {
    notificationService.notifyWorkspaceEvent(
      'Workspace Error',
      `Error in workspace "${workspaceName}": ${error}`,
      workspaceId,
      'error'
    );
  }, []);

  // Session-specific notifications
  const notifySessionCreated = useCallback((sessionName: string) => {
    if (currentSession && currentWorkspace) {
      notificationService.notifySessionEvent(
        'Session Created',
        `Started new session "${sessionName}"`,
        currentSession.id,
        currentWorkspace.id,
        'success'
      );
    }
  }, [currentSession, currentWorkspace]);

  const notifySessionEnded = useCallback((sessionName: string) => {
    if (currentSession && currentWorkspace) {
      notificationService.notifySessionEvent(
        'Session Ended',
        `Session "${sessionName}" has ended`,
        currentSession.id,
        currentWorkspace.id,
        'info'
      );
    }
  }, [currentSession, currentWorkspace]);

  const notifySessionError = useCallback((sessionName: string, error: string) => {
    if (currentSession && currentWorkspace) {
      notificationService.notifySessionEvent(
        'Session Error',
        `Error in session "${sessionName}": ${error}`,
        currentSession.id,
        currentWorkspace.id,
        'error'
      );
    }
  }, [currentSession, currentWorkspace]);

  // Collaboration notifications
  const notifyUserJoined = useCallback((username: string, workspaceId: string) => {
    notificationService.notifyCollaborationEvent(
      'User Joined',
      `${username} joined the workspace`,
      workspaceId,
      'info'
    );
  }, []);

  const notifyUserLeft = useCallback((username: string, workspaceId: string) => {
    notificationService.notifyCollaborationEvent(
      'User Left',
      `${username} left the workspace`,
      workspaceId,
      'info'
    );
  }, []);

  return {
    // Legacy methods for backward compatibility
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Enhanced notification features
    requestPermission,
    getSettings,
    updateSettings,
    testNotification,
    
    // Workspace notifications
    notifyWorkspaceCreated,
    notifyWorkspaceDeleted,
    notifyWorkspaceError,
    
    // Session notifications
    notifySessionCreated,
    notifySessionEnded,
    notifySessionError,
    
    // Collaboration notifications
    notifyUserJoined,
    notifyUserLeft,
    
    // Direct service access
    notificationService
  };
}
