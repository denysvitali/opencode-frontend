import { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, Clock, Activity } from 'lucide-react';
import { useRealTime } from '../../hooks/useRealTime.js';
import type { RealTimeStatus } from '../../hooks/useRealTime.js';

interface LiveStatusIndicatorProps {
  workspaceId?: string;
  userId?: string;
  className?: string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4', 
  lg: 'h-5 w-5'
};

const sizePulse = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4'
};

/**
 * Live status indicator component showing real-time connection status
 * and workspace activity
 */
export default function LiveStatusIndicator({
  workspaceId,
  userId,
  className = '',
  showDetails = false,
  size = 'md'
}: LiveStatusIndicatorProps) {
  const realTime = useRealTime({
    workspaceId,
    userId,
    enableWorkspaceUpdates: !!workspaceId,
    enableActivityNotifications: true,
    autoConnect: true
  });

  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Update last activity when connection status changes
  useEffect(() => {
    if (realTime.isConnected) {
      setLastActivity(new Date());
    }
  }, [realTime.isConnected]);

  const getStatusConfig = (status: RealTimeStatus) => {
    switch (status.connectionStatus) {
      case 'connected':
        return {
          icon: Wifi,
          color: 'text-green-400',
          bgColor: 'bg-green-400/20',
          pulseColor: 'bg-green-400',
          label: 'Connected',
          description: 'Real-time updates active'
        };
      case 'connecting':
        return {
          icon: Clock,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/20',
          pulseColor: 'bg-yellow-400',
          label: 'Connecting',
          description: 'Establishing connection...'
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/20',
          pulseColor: 'bg-gray-400',
          label: 'Disconnected',
          description: 'No real-time updates'
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-400',
          bgColor: 'bg-red-400/20',
          pulseColor: 'bg-red-400',
          label: 'Error',
          description: 'Connection failed'
        };
      default:
        return {
          icon: WifiOff,
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/20',
          pulseColor: 'bg-gray-400',
          label: 'Unknown',
          description: 'Status unknown'
        };
    }
  };

  const config = getStatusConfig(realTime);
  const StatusIcon = config.icon;

  const handleRetryConnection = () => {
    realTime.connect().catch(error => {
      console.error('Failed to reconnect:', error);
    });
  };

  if (!showDetails) {
    // Simple indicator
    return (
      <div
        className={`relative inline-flex items-center ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className={`relative flex items-center justify-center rounded-full ${config.bgColor} p-1`}>
          <StatusIcon className={`${sizeStyles[size]} ${config.color}`} />
          
          {/* Pulse animation for active states */}
          {(realTime.isConnecting || realTime.isConnected) && (
            <div className={`absolute inset-0 rounded-full ${config.pulseColor} opacity-75 animate-ping`}>
              <div className={`${sizePulse[size]} m-auto mt-1 rounded-full ${config.pulseColor}`} />
            </div>
          )}
        </div>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-50">
            {config.label}: {config.description}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
      </div>
    );
  }

  // Detailed status panel
  return (
    <div className={`bg-gray-800/50 rounded-lg border border-gray-700 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">Real-time Status</h3>
        <div className="flex items-center gap-2">
          <div className={`relative flex items-center justify-center rounded-full ${config.bgColor} p-1`}>
            <StatusIcon className={`${sizeStyles[size]} ${config.color}`} />
            
            {/* Pulse animation */}
            {(realTime.isConnecting || realTime.isConnected) && (
              <div className={`absolute inset-0 rounded-full ${config.pulseColor} opacity-75 animate-ping`}>
                <div className={`${sizePulse[size]} m-auto mt-1 rounded-full ${config.pulseColor}`} />
              </div>
            )}
          </div>
          
          <span className={`text-sm font-medium ${config.color}`}>
            {config.label}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-xs text-gray-400">
        <div className="flex justify-between">
          <span>Status:</span>
          <span className={config.color}>{config.description}</span>
        </div>
        
        {lastActivity && (
          <div className="flex justify-between">
            <span>Last Activity:</span>
            <span>{lastActivity.toLocaleTimeString()}</span>
          </div>
        )}
        
        {workspaceId && (
          <div className="flex justify-between">
            <span>Workspace:</span>
            <span>{workspaceId.slice(0, 8)}...</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-3">
        {!realTime.isConnected && (
          <button
            onClick={handleRetryConnection}
            className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
          >
            <Activity className="h-3 w-3" />
            Reconnect
          </button>
        )}
        
        {realTime.isConnected && (
          <button
            onClick={realTime.disconnect}
            className="flex items-center gap-1 text-xs bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded transition-colors"
          >
            <WifiOff className="h-3 w-3" />
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Simple connection status dot for use in headers/navigation
 */
export function ConnectionStatusDot({ 
  className = '', 
  size = 'sm' 
}: { 
  className?: string; 
  size?: 'sm' | 'md' | 'lg';
}) {
  const realTime = useRealTime({ autoConnect: true });
  
  const getStatusColor = () => {
    switch (realTime.connectionStatus) {
      case 'connected':
        return 'bg-green-400';
      case 'connecting':
        return 'bg-yellow-400 animate-pulse';
      case 'disconnected':
        return 'bg-gray-400';
      case 'error':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  };

  const dotSizes = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  return (
    <div 
      className={`rounded-full ${getStatusColor()} ${dotSizes[size]} ${className}`}
      title={`Connection: ${realTime.connectionStatus}`}
    />
  );
}
