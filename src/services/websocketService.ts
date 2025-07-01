/**
 * WebSocket service for real-time communication
 * Handles workspace status updates, activity notifications, and live data sync
 */

export interface WebSocketMessage {
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
  id?: string;
}

export interface WorkspaceStatusUpdate {
  workspaceId: string;
  status: 'running' | 'creating' | 'stopped' | 'error';
  message?: string;
  progress?: number;
}

export interface ActivityNotification {
  id: string;
  type: 'workspace_created' | 'workspace_started' | 'workspace_stopped' | 'session_updated' | 'error';
  title: string;
  message: string;
  workspaceId?: string;
  sessionId?: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  autoClose?: boolean;
}

export interface WebSocketEventHandlers {
  onWorkspaceStatusUpdate?: (update: WorkspaceStatusUpdate) => void;
  onActivityNotification?: (notification: ActivityNotification) => void;
  onSessionUpdate?: (sessionData: Record<string, unknown>) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Event) => void;
  onReconnected?: () => void;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private eventHandlers: WebSocketEventHandlers = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Max 30 seconds
  private connectionId: string | null = null;
  private isConnecting = false;
  private messageQueue: WebSocketMessage[] = [];

  constructor(baseUrl?: string) {
    // Default to localhost development server, in production this should come from config
    this.url = baseUrl || 'ws://localhost:8080/ws';
  }

  /**
   * Connect to the WebSocket server
   */
  connect(handlers: WebSocketEventHandlers = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;
      this.eventHandlers = { ...this.eventHandlers, ...handlers };

      try {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          
          // Send queued messages
          this.flushMessageQueue();
          
          this.eventHandlers.onConnected?.();
          
          if (this.reconnectAttempts > 0) {
            this.eventHandlers.onReconnected?.();
          }
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.eventHandlers.onDisconnected?.();
          
          // Attempt to reconnect unless it was a clean close
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (event) => {
          console.error('WebSocket error:', event);
          this.isConnecting = false;
          this.eventHandlers.onError?.(event);
          reject(new Error('WebSocket connection failed'));
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.connectionId = null;
  }

  /**
   * Send a message to the server
   */
  send(type: string, payload: Record<string, unknown>): void {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: Date.now(),
      id: this.generateMessageId()
    };

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push(message);
      console.warn('WebSocket not connected, message queued:', message);
    }
  }

  /**
   * Subscribe to workspace updates
   */
  subscribeToWorkspace(workspaceId: string): void {
    this.send('subscribe_workspace', { workspaceId });
  }

  /**
   * Unsubscribe from workspace updates
   */
  unsubscribeFromWorkspace(workspaceId: string): void {
    this.send('unsubscribe_workspace', { workspaceId });
  }

  /**
   * Subscribe to user activity notifications
   */
  subscribeToNotifications(userId: string): void {
    this.send('subscribe_notifications', { userId });
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    if (this.isConnecting) return 'connecting';
    if (this.ws?.readyState === WebSocket.OPEN) return 'connected';
    if (this.ws?.readyState === WebSocket.CLOSED) return 'disconnected';
    return 'error';
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'workspace_status_update':
        this.eventHandlers.onWorkspaceStatusUpdate?.(message.payload as unknown as WorkspaceStatusUpdate);
        break;
      
      case 'activity_notification':
        this.eventHandlers.onActivityNotification?.(message.payload as unknown as ActivityNotification);
        break;
      
      case 'session_update':
        this.eventHandlers.onSessionUpdate?.(message.payload);
        break;
      
      case 'connection_ack':
        this.connectionId = (message.payload as { connectionId?: string }).connectionId || null;
        console.log('WebSocket connection acknowledged:', this.connectionId);
        break;
      
      default:
        console.log('Unknown message type:', message.type, message.payload);
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connect(this.eventHandlers).catch(error => {
          console.error('Reconnection failed:', error);
        });
      }
    }, delay);
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      }
    }
  }

  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update event handlers
   */
  updateHandlers(handlers: Partial<WebSocketEventHandlers>): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }
}

// Singleton instance
export const websocketService = new WebSocketService();

export default websocketService;
