import { useEffect, useCallback, useRef } from 'react';
import { useNotifications } from './useNotifications.js';
import websocketService, { 
  type WebSocketEventHandlers, 
  type WorkspaceStatusUpdate, 
  type ActivityNotification 
} from '../services/websocketService.js';
import { useWorkspaceAppStore } from '../stores/workspaceStore.js';

interface UseRealTimeOptions {
  userId?: string;
  workspaceId?: string;
  enableWorkspaceUpdates?: boolean;
  enableActivityNotifications?: boolean;
  autoConnect?: boolean;
}

export interface RealTimeStatus {
  isConnected: boolean;
  isConnecting: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastError?: string;
  reconnectAttempts?: number;
}

/**
 * Hook for managing real-time features via WebSocket
 * Handles workspace status updates, activity notifications, and connection management
 */
export function useRealTime({
  userId,
  workspaceId,
  enableWorkspaceUpdates = true,
  enableActivityNotifications = true,
  autoConnect = true
}: UseRealTimeOptions = {}) {
  const { addNotification } = useNotifications();
  const { updateWorkspace, loadWorkspacesFromAPI } = useWorkspaceAppStore();
  const connectionRef = useRef<boolean>(false);
  const currentWorkspaceRef = useRef<string | undefined>(workspaceId);

  // Update workspace reference when it changes
  useEffect(() => {
    currentWorkspaceRef.current = workspaceId;
  }, [workspaceId]);

  // Handle workspace status updates
  const handleWorkspaceStatusUpdate = useCallback((update: WorkspaceStatusUpdate) => {
    console.log('Workspace status update:', update);
    
    // Update workspace status in store
    updateWorkspace(update.workspaceId, { status: update.status });
    
    // Show notification for status changes
    if (enableActivityNotifications) {
      const statusMessages = {
        running: 'Workspace is now running',
        creating: 'Workspace is starting up...',
        stopped: 'Workspace has been stopped',
        error: update.message || 'Workspace encountered an error'
      };

      addNotification({
        type: update.status === 'error' ? 'error' : 'info',
        title: `Workspace ${update.status}`,
        message: statusMessages[update.status],
        duration: update.status === 'creating' ? undefined : 5000, // Keep creating status until it changes
        // Note: Custom properties like workspaceId would need to be added to the Notification interface
      });
    }

    // Refresh workspace data if it's the current workspace
    if (update.workspaceId === currentWorkspaceRef.current) {
      loadWorkspacesFromAPI();
    }
  }, [updateWorkspace, addNotification, enableActivityNotifications, loadWorkspacesFromAPI]);

  // Handle activity notifications
  const handleActivityNotification = useCallback((notification: ActivityNotification) => {
    console.log('Activity notification:', notification);
    
    if (enableActivityNotifications) {
      addNotification({
        type: notification.severity,
        title: notification.title,
        message: notification.message,
        duration: notification.autoClose !== false ? 5000 : undefined,
        // Note: Custom properties like workspaceId would need to be added to the Notification interface
      });
    }
  }, [addNotification, enableActivityNotifications]);

  // Handle connection events
  const handleConnected = useCallback(() => {
    console.log('Real-time connection established');
    connectionRef.current = true;
    
    // Subscribe to user notifications
    if (userId && enableActivityNotifications) {
      websocketService.subscribeToNotifications(userId);
    }
    
    // Subscribe to workspace updates
    if (workspaceId && enableWorkspaceUpdates) {
      websocketService.subscribeToWorkspace(workspaceId);
    }
  }, [userId, workspaceId, enableActivityNotifications, enableWorkspaceUpdates]);

  const handleDisconnected = useCallback(() => {
    console.log('Real-time connection lost');
    connectionRef.current = false;
  }, []);

  const handleError = useCallback((error: Event) => {
    console.error('Real-time connection error:', error);
    connectionRef.current = false;
  }, []);

  const handleReconnected = useCallback(() => {
    console.log('Real-time connection restored');
    connectionRef.current = true;
    
    if (enableActivityNotifications) {
      addNotification({
        type: 'success',
        title: 'Connection Restored',
        message: 'Real-time updates are now active',
        duration: 3000
      });
    }
  }, [addNotification, enableActivityNotifications]);

  // Connect to WebSocket when component mounts or options change
  useEffect(() => {
    if (!autoConnect) return;

    const handlers: WebSocketEventHandlers = {
      onWorkspaceStatusUpdate: enableWorkspaceUpdates ? handleWorkspaceStatusUpdate : undefined,
      onActivityNotification: enableActivityNotifications ? handleActivityNotification : undefined,
      onConnected: handleConnected,
      onDisconnected: handleDisconnected,
      onError: handleError,
      onReconnected: handleReconnected
    };

    websocketService.connect(handlers).catch(error => {
      console.error('Failed to connect to real-time service:', error);
    });

    return () => {
      // Note: We don't disconnect here as other components might be using the connection
      // The WebSocket service handles connection sharing
    };
  }, [
    autoConnect,
    enableWorkspaceUpdates,
    enableActivityNotifications,
    handleWorkspaceStatusUpdate,
    handleActivityNotification,
    handleConnected,
    handleDisconnected,
    handleError,
    handleReconnected
  ]);

  // Subscribe/unsubscribe to workspace updates when workspaceId changes
  useEffect(() => {
    if (!enableWorkspaceUpdates || !websocketService.isConnected()) return;

    // Unsubscribe from previous workspace
    const previousWorkspaceId = currentWorkspaceRef.current;
    if (previousWorkspaceId && previousWorkspaceId !== workspaceId) {
      websocketService.unsubscribeFromWorkspace(previousWorkspaceId);
    }

    // Subscribe to new workspace
    if (workspaceId) {
      websocketService.subscribeToWorkspace(workspaceId);
    }
  }, [workspaceId, enableWorkspaceUpdates]);

  // Manual connection controls
  const connect = useCallback(async () => {
    try {
      await websocketService.connect({
        onWorkspaceStatusUpdate: enableWorkspaceUpdates ? handleWorkspaceStatusUpdate : undefined,
        onActivityNotification: enableActivityNotifications ? handleActivityNotification : undefined,
        onConnected: handleConnected,
        onDisconnected: handleDisconnected,
        onError: handleError,
        onReconnected: handleReconnected
      });
    } catch (error) {
      console.error('Failed to connect to real-time service:', error);
      throw error;
    }
  }, [
    enableWorkspaceUpdates,
    enableActivityNotifications,
    handleWorkspaceStatusUpdate,
    handleActivityNotification,
    handleConnected,
    handleDisconnected,
    handleError,
    handleReconnected
  ]);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  const subscribeToWorkspace = useCallback((workspaceId: string) => {
    if (websocketService.isConnected()) {
      websocketService.subscribeToWorkspace(workspaceId);
    }
  }, []);

  const unsubscribeFromWorkspace = useCallback((workspaceId: string) => {
    if (websocketService.isConnected()) {
      websocketService.unsubscribeFromWorkspace(workspaceId);
    }
  }, []);

  // Get current connection status
  const getStatus = useCallback((): RealTimeStatus => {
    return {
      isConnected: websocketService.isConnected(),
      isConnecting: websocketService.getConnectionStatus() === 'connecting',
      connectionStatus: websocketService.getConnectionStatus()
    };
  }, []);

  return {
    // Status
    ...getStatus(),
    
    // Manual controls
    connect,
    disconnect,
    subscribeToWorkspace,
    unsubscribeFromWorkspace,
    
    // Utilities
    getStatus
  };
}

export default useRealTime;
