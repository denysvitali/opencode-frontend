import { useState, useEffect, useCallback } from 'react';
import { AgentActivity } from '../components/ui/ActivityIndicator.js';
import { websocketService } from '../services/websocketService.js';

export interface UseAgentActivityOptions {
  sessionId?: string;
  workspaceId?: string;
  autoCleanup?: boolean;
  cleanupDelay?: number;
}

export function useAgentActivity({ 
  sessionId, 
  workspaceId, 
  autoCleanup = true, 
  cleanupDelay = 30000 // 30 seconds
}: UseAgentActivityOptions = {}) {
  const [activities, setActivities] = useState<AgentActivity[]>([]);

  // Add a new activity
  const addActivity = useCallback((activity: Omit<AgentActivity, 'id' | 'startTime'>) => {
    const newActivity: AgentActivity = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startTime: Date.now()
    };

    setActivities(prev => [...prev, newActivity]);
    return newActivity.id;
  }, []);

  // Update an existing activity
  const updateActivity = useCallback((id: string, updates: Partial<Omit<AgentActivity, 'id' | 'startTime'>>) => {
    setActivities(prev => prev.map(activity => 
      activity.id === id 
        ? { 
            ...activity, 
            ...updates,
            endTime: ['completed', 'error'].includes(updates.status || '') ? Date.now() : activity.endTime
          }
        : activity
    ));
  }, []);

  // Remove an activity
  const removeActivity = useCallback((id: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== id));
  }, []);

  // Clear all activities
  const clearActivities = useCallback(() => {
    setActivities([]);
  }, []);

  // Get activities by status
  const getActivitiesByStatus = useCallback((status: AgentActivity['status']) => {
    return activities.filter(activity => activity.status === status);
  }, [activities]);

  // Get active activities count
  const getActiveCount = useCallback(() => {
    return activities.filter(activity => activity.status === 'active').length;
  }, [activities]);

  // Check if agent is working
  const isAgentWorking = useCallback(() => {
    return activities.some(activity => activity.status === 'active');
  }, [activities]);

  // Quick activity creation methods
  const startCodeGeneration = useCallback((title: string, description?: string, sessionId?: string, workspaceId?: string) => {
    return addActivity({
      type: 'code_generation',
      status: 'active',
      title,
      description,
      sessionId: sessionId || '',
      workspaceId: workspaceId || ''
    });
  }, [addActivity]);

  const startFileEditing = useCallback((title: string, description?: string, sessionId?: string, workspaceId?: string) => {
    return addActivity({
      type: 'file_editing',
      status: 'active',
      title,
      description,
      sessionId: sessionId || '',
      workspaceId: workspaceId || ''
    });
  }, [addActivity]);

  const startTerminalExecution = useCallback((title: string, description?: string, sessionId?: string, workspaceId?: string) => {
    return addActivity({
      type: 'terminal_execution',
      status: 'active',
      title,
      description,
      sessionId: sessionId || '',
      workspaceId: workspaceId || ''
    });
  }, [addActivity]);

  const startGitOperation = useCallback((title: string, description?: string, sessionId?: string, workspaceId?: string) => {
    return addActivity({
      type: 'git_operation',
      status: 'active',
      title,
      description,
      sessionId: sessionId || '',
      workspaceId: workspaceId || ''
    });
  }, [addActivity]);

  const startAnalysis = useCallback((title: string, description?: string, sessionId?: string, workspaceId?: string) => {
    return addActivity({
      type: 'analysis',
      status: 'active',
      title,
      description,
      sessionId: sessionId || '',
      workspaceId: workspaceId || ''
    });
  }, [addActivity]);

  const startPlanning = useCallback((title: string, description?: string, sessionId?: string, workspaceId?: string) => {
    return addActivity({
      type: 'planning',
      status: 'active',
      title,
      description,
      sessionId: sessionId || '',
      workspaceId: workspaceId || ''
    });
  }, [addActivity]);

  // Complete an activity
  const completeActivity = useCallback((id: string, description?: string) => {
    updateActivity(id, { 
      status: 'completed',
      description: description || undefined
    });
  }, [updateActivity]);

  // Mark activity as error
  const errorActivity = useCallback((id: string, error: string) => {
    updateActivity(id, { 
      status: 'error',
      description: error
    });
  }, [updateActivity]);

  // Update activity progress
  const updateProgress = useCallback((id: string, progress: number) => {
    updateActivity(id, { progress: Math.max(0, Math.min(100, progress)) });
  }, [updateActivity]);

  // Auto-cleanup completed activities
  useEffect(() => {
    if (!autoCleanup) return;

    const cleanup = () => {
      const now = Date.now();
      setActivities(prev => prev.filter(activity => {
        // Keep active and paused activities
        if (['active', 'paused', 'waiting'].includes(activity.status)) {
          return true;
        }
        
        // Remove completed/error activities after delay
        if (activity.endTime && (now - activity.endTime) > cleanupDelay) {
          return false;
        }
        
        return true;
      }));
    };

    const interval = setInterval(cleanup, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [autoCleanup, cleanupDelay]);

  // Handle WebSocket messages for agent activities
  useEffect(() => {
    const handleSessionUpdate = (sessionData: Record<string, unknown>) => {
      // Handle agent activity updates from WebSocket
      if (sessionData.agentActivity) {
        const activityData = sessionData.agentActivity as Record<string, unknown>;
        
        if (activityData.type === 'activity_start') {
          addActivity({
            type: (activityData.activityType as AgentActivity['type']) || 'analysis',
            status: 'active',
            title: (activityData.title as string) || 'AI Agent Working',
            description: activityData.description as string,
            sessionId: (activityData.sessionId as string) || sessionId || '',
            workspaceId: (activityData.workspaceId as string) || workspaceId || '',
            metadata: activityData.metadata as Record<string, unknown>
          });
        } else if (activityData.type === 'activity_update' && activityData.activityId) {
          updateActivity(activityData.activityId as string, {
            progress: activityData.progress as number,
            description: activityData.description as string,
            status: (activityData.status as AgentActivity['status']) || 'active'
          });
        } else if (activityData.type === 'activity_complete' && activityData.activityId) {
          completeActivity(activityData.activityId as string, activityData.description as string);
        } else if (activityData.type === 'activity_error' && activityData.activityId) {
          errorActivity(activityData.activityId as string, (activityData.error as string) || 'An error occurred');
        }
      }
    };

    const handlers = {
      onSessionUpdate: handleSessionUpdate
    };

    websocketService.updateHandlers(handlers);

    return () => {
      // Cleanup handlers if needed
    };
  }, [addActivity, updateActivity, completeActivity, errorActivity, sessionId, workspaceId]);

  // Filter activities by session/workspace if specified
  const filteredActivities = activities.filter(activity => {
    if (sessionId && activity.sessionId !== sessionId) return false;
    if (workspaceId && activity.workspaceId !== workspaceId) return false;
    return true;
  });

  return {
    // State
    activities: filteredActivities,
    allActivities: activities,
    
    // Actions
    addActivity,
    updateActivity,
    removeActivity,
    clearActivities,
    
    // Quick methods
    startCodeGeneration,
    startFileEditing,
    startTerminalExecution,
    startGitOperation,
    startAnalysis,
    startPlanning,
    completeActivity,
    errorActivity,
    updateProgress,
    
    // Queries
    getActivitiesByStatus,
    getActiveCount,
    isAgentWorking,
    
    // Computed values
    activeActivities: filteredActivities.filter(a => a.status === 'active'),
    completedActivities: filteredActivities.filter(a => a.status === 'completed'),
    errorActivities: filteredActivities.filter(a => a.status === 'error')
  };
}

export default useAgentActivity;