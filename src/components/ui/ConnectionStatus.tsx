import React from 'react';
import { Wifi, WifiOff, AlertCircle, Loader2 } from 'lucide-react';
import { useWorkspaceAppStore } from '../../stores/workspaceStore.js';

export function ConnectionStatus() {
  const { connectionStatus, checkHealthAPI } = useWorkspaceAppStore();
  const [isChecking, setIsChecking] = React.useState(false);

  const handleCheckConnection = async () => {
    setIsChecking(true);
    try {
      await checkHealthAPI();
    } finally {
      setIsChecking(false);
    }
  };

  // Auto-check connection status every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!isChecking) {
        checkHealthAPI();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [checkHealthAPI, isChecking]);

  const getStatusIcon = () => {
    if (isChecking) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'disconnected':
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking...';
    
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Error';
      case 'disconnected':
      default:
        return 'Disconnected';
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'disconnected':
      default:
        return 'text-gray-400';
    }
  };

  return (
    <button
      onClick={handleCheckConnection}
      disabled={isChecking}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50"
      title="Check API connection status"
    >
      {getStatusIcon()}
      <span className={`text-sm font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </span>
    </button>
  );
}
