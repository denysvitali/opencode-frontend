/**
 * Push notification service for workspace and session events
 * Handles browser notifications and in-app notification system
 */

export interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  type: 'workspace' | 'session' | 'collaboration' | 'system';
  severity: 'info' | 'success' | 'warning' | 'error';
  workspaceId?: string;
  sessionId?: string;
  timestamp: number;
  autoClose?: boolean;
  actionUrl?: string;
  icon?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  browserNotifications: boolean;
  workspaceEvents: boolean;
  sessionEvents: boolean;
  collaborationEvents: boolean;
  systemEvents: boolean;
  sound: boolean;
  autoClose: boolean;
  persistence: boolean;
}

type NotificationListener = (notification: NotificationPayload) => void;

class NotificationService {
  private listeners: Set<NotificationListener> = new Set();
  private notifications: NotificationPayload[] = [];
  private settings: NotificationSettings = {
    enabled: true,
    browserNotifications: true,
    workspaceEvents: true,
    sessionEvents: true,
    collaborationEvents: true,
    systemEvents: true,
    sound: false,
    autoClose: true,
    persistence: true
  };
  private maxNotifications = 50;
  private notificationPermission: NotificationPermission = 'default';

  constructor() {
    this.loadSettings();
    this.checkBrowserNotificationPermission();
  }

  /**
   * Request browser notification permission
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Browser notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;
      
      if (permission === 'granted') {
        this.updateSettings({ browserNotifications: true });
        return true;
      } else {
        this.updateSettings({ browserNotifications: false });
        return false;
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  /**
   * Check current browser notification permission
   */
  private checkBrowserNotificationPermission(): void {
    if ('Notification' in window) {
      this.notificationPermission = Notification.permission;
    }
  }

  /**
   * Show a notification
   */
  notify(notification: Omit<NotificationPayload, 'id' | 'timestamp'>): string {
    const fullNotification: NotificationPayload = {
      ...notification,
      id: this.generateNotificationId(),
      timestamp: Date.now()
    };

    // Check if notification should be shown based on settings
    if (!this.shouldShowNotification(fullNotification)) {
      return fullNotification.id;
    }

    // Add to notification history
    this.addToHistory(fullNotification);

    // Show browser notification if enabled and permitted
    if (this.settings.browserNotifications && this.notificationPermission === 'granted') {
      this.showBrowserNotification(fullNotification);
    }

    // Play sound if enabled
    if (this.settings.sound) {
      this.playNotificationSound(fullNotification.severity);
    }

    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener(fullNotification);
      } catch (error) {
        console.error('Notification listener error:', error);
      }
    });

    return fullNotification.id;
  }

  /**
   * Quick notification methods for common types
   */
  notifyWorkspaceEvent(title: string, message: string, workspaceId: string, severity: NotificationPayload['severity'] = 'info'): string {
    return this.notify({
      title,
      message,
      type: 'workspace',
      severity,
      workspaceId,
      autoClose: severity !== 'error'
    });
  }

  notifySessionEvent(title: string, message: string, sessionId: string, workspaceId?: string, severity: NotificationPayload['severity'] = 'info'): string {
    return this.notify({
      title,
      message,
      type: 'session',
      severity,
      sessionId,
      workspaceId,
      autoClose: severity !== 'error'
    });
  }

  notifyCollaborationEvent(title: string, message: string, workspaceId: string, severity: NotificationPayload['severity'] = 'info'): string {
    return this.notify({
      title,
      message,
      type: 'collaboration',
      severity,
      workspaceId,
      autoClose: true
    });
  }

  notifySystemEvent(title: string, message: string, severity: NotificationPayload['severity'] = 'info'): string {
    return this.notify({
      title,
      message,
      type: 'system',
      severity,
      autoClose: severity === 'success'
    });
  }

  /**
   * Subscribe to notifications
   */
  subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get notification history
   */
  getNotifications(): NotificationPayload[] {
    return [...this.notifications];
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(): NotificationPayload[] {
    // In a real implementation, you'd track read status
    return this.notifications.slice(-10); // Return last 10 as "unread"
  }

  /**
   * Clear notification by ID
   */
  clearNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications(): void {
    this.notifications = [];
  }

  /**
   * Clear notifications by type
   */
  clearNotificationsByType(type: NotificationPayload['type']): void {
    this.notifications = this.notifications.filter(n => n.type !== type);
  }

  /**
   * Update notification settings
   */
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  /**
   * Get current settings
   */
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  /**
   * Test notification functionality
   */
  testNotification(): void {
    this.notify({
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working properly.',
      type: 'system',
      severity: 'info',
      autoClose: true
    });
  }

  private shouldShowNotification(notification: NotificationPayload): boolean {
    if (!this.settings.enabled) return false;

    switch (notification.type) {
      case 'workspace':
        return this.settings.workspaceEvents;
      case 'session':
        return this.settings.sessionEvents;
      case 'collaboration':
        return this.settings.collaborationEvents;
      case 'system':
        return this.settings.systemEvents;
      default:
        return true;
    }
  }

  private addToHistory(notification: NotificationPayload): void {
    this.notifications.unshift(notification);
    
    // Limit history size
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    // Save to localStorage if persistence is enabled
    if (this.settings.persistence) {
      this.saveNotifications();
    }
  }

  private showBrowserNotification(notification: NotificationPayload): void {
    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: notification.icon || '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.severity === 'error',
        silent: !this.settings.sound
      });

      // Auto-close browser notification
      if (notification.autoClose && notification.severity !== 'error') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }

      // Handle notification click
      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
        
        // Navigate to action URL if provided
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
      };

    } catch (error) {
      console.error('Failed to show browser notification:', error);
    }
  }

  private playNotificationSound(severity: NotificationPayload['severity']): void {
    try {
      // Simple beep sounds using Web Audio API
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different severity levels
      const frequencies = {
        info: 800,
        success: 1000,
        warning: 600,
        error: 400
      };

      oscillator.frequency.setValueAtTime(frequencies[severity] || 800, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);

    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }

  private generateNotificationId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('opencode_notification_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('opencode_notification_settings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        this.settings = { ...this.settings, ...parsedSettings };
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  }

  private saveNotifications(): void {
    try {
      // Only save recent notifications to avoid localStorage bloat
      const recentNotifications = this.notifications.slice(0, 20);
      localStorage.setItem('opencode_notifications', JSON.stringify(recentNotifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

}

// Singleton instance
export const notificationService = new NotificationService();

export default notificationService;