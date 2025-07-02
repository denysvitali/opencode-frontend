import React, { useState, useEffect } from 'react';
import { Bot, Code, FileText, Terminal, GitBranch, Loader2, Play, Pause, CheckCircle, AlertCircle } from 'lucide-react';

export interface AgentActivity {
  id: string;
  sessionId: string;
  workspaceId: string;
  type: 'code_generation' | 'file_editing' | 'terminal_execution' | 'git_operation' | 'analysis' | 'planning';
  status: 'active' | 'paused' | 'completed' | 'error' | 'waiting';
  title: string;
  description?: string;
  progress?: number;
  startTime: number;
  endTime?: number;
  metadata?: Record<string, unknown>;
}

interface ActivityIndicatorProps {
  activities: AgentActivity[];
  sessionId?: string;
  workspaceId?: string;
  compact?: boolean;
  showProgress?: boolean;
  className?: string;
}

export function ActivityIndicator({ 
  activities, 
  sessionId, 
  workspaceId,
  compact = false,
  showProgress = true,
  className = '' 
}: ActivityIndicatorProps) {
  const [visibleActivities, setVisibleActivities] = useState<AgentActivity[]>([]);

  // Filter activities based on session/workspace
  useEffect(() => {
    let filtered = activities;
    
    if (sessionId) {
      filtered = filtered.filter(activity => activity.sessionId === sessionId);
    }
    
    if (workspaceId) {
      filtered = filtered.filter(activity => activity.workspaceId === workspaceId);
    }
    
    // Show only active and recent activities
    const now = Date.now();
    filtered = filtered.filter(activity => 
      activity.status === 'active' || 
      (activity.endTime && (now - activity.endTime) < 30000) // Show completed activities for 30 seconds
    );
    
    // Sort by start time, most recent first
    filtered.sort((a, b) => b.startTime - a.startTime);
    
    setVisibleActivities(filtered);
  }, [activities, sessionId, workspaceId]);

  const getActivityIcon = (type: AgentActivity['type'], status: AgentActivity['status']) => {
    const iconClass = "h-4 w-4";
    
    if (status === 'active') {
      switch (type) {
        case 'code_generation':
          return <Code className={`${iconClass} text-blue-400`} />;
        case 'file_editing':
          return <FileText className={`${iconClass} text-green-400`} />;
        case 'terminal_execution':
          return <Terminal className={`${iconClass} text-yellow-400`} />;
        case 'git_operation':
          return <GitBranch className={`${iconClass} text-purple-400`} />;
        case 'analysis':
          return <Bot className={`${iconClass} text-cyan-400`} />;
        case 'planning':
          return <Bot className={`${iconClass} text-indigo-400`} />;
        default:
          return <Bot className={`${iconClass} text-gray-400`} />;
      }
    }
    
    // Status-based icons
    switch (status) {
      case 'completed':
        return <CheckCircle className={`${iconClass} text-green-400`} />;
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-400`} />;
      case 'paused':
        return <Pause className={`${iconClass} text-yellow-400`} />;
      case 'waiting':
        return <Play className={`${iconClass} text-gray-400`} />;
      default:
        return <Loader2 className={`${iconClass} text-blue-400 animate-spin`} />;
    }
  };

  const getStatusColor = (status: AgentActivity['status']) => {
    switch (status) {
      case 'active':
        return 'border-blue-400 bg-blue-900/20';
      case 'completed':
        return 'border-green-400 bg-green-900/20';
      case 'error':
        return 'border-red-400 bg-red-900/20';
      case 'paused':
        return 'border-yellow-400 bg-yellow-900/20';
      case 'waiting':
        return 'border-gray-400 bg-gray-900/20';
      default:
        return 'border-gray-600 bg-gray-900/20';
    }
  };

  const formatDuration = (startTime: number, endTime?: number) => {
    const duration = (endTime || Date.now()) - startTime;
    const seconds = Math.floor(duration / 1000);
    
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const getActivityTypeLabel = (type: AgentActivity['type']) => {
    switch (type) {
      case 'code_generation':
        return 'Generating Code';
      case 'file_editing':
        return 'Editing Files';
      case 'terminal_execution':
        return 'Running Commands';
      case 'git_operation':
        return 'Git Operation';
      case 'analysis':
        return 'Analyzing';
      case 'planning':
        return 'Planning';
      default:
        return 'Working';
    }
  };

  if (visibleActivities.length === 0) {
    return null;
  }

  if (compact) {
    const activeCount = visibleActivities.filter(a => a.status === 'active').length;
    
    if (activeCount === 0) {
      return null;
    }

    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-1">
          <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
          <span className="text-sm text-gray-300">
            AI Agent {activeCount === 1 ? 'is' : `(${activeCount}) are`} working
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {visibleActivities.map((activity) => (
        <div
          key={activity.id}
          className={`flex items-start space-x-3 p-3 rounded-lg border-l-2 ${getStatusColor(activity.status)}`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getActivityIcon(activity.type, activity.status)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {activity.title}
                </p>
                {activity.description && (
                  <p className="text-sm text-gray-300 mt-1">
                    {activity.description}
                  </p>
                )}
                
                <div className="flex items-center space-x-3 mt-2">
                  <span className="text-xs text-gray-500 capitalize">
                    {getActivityTypeLabel(activity.type)}
                  </span>
                  
                  <span className="text-xs text-gray-500">
                    {formatDuration(activity.startTime, activity.endTime)}
                  </span>
                  
                  <span className={`text-xs px-2 py-1 rounded capitalize ${
                    activity.status === 'active' ? 'bg-blue-900 text-blue-300' :
                    activity.status === 'completed' ? 'bg-green-900 text-green-300' :
                    activity.status === 'error' ? 'bg-red-900 text-red-300' :
                    activity.status === 'paused' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-gray-900 text-gray-300'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Progress bar */}
            {showProgress && activity.progress !== undefined && activity.status === 'active' && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-gray-300">{Math.round(activity.progress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${activity.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ActivityIndicator;