import { AlertCircle, RefreshCw, X } from 'lucide-react';
import type { APIError } from '../../types/index.js';

interface ErrorDisplayProps {
  error: APIError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export function ErrorDisplay({ error, onRetry, onDismiss, showDismiss = true }: ErrorDisplayProps) {
  const getErrorTitle = (code: string) => {
    switch (code) {
      case 'LOAD_WORKSPACES_FAILED':
        return 'Failed to Load Workspaces';
      case 'CREATE_WORKSPACE_FAILED':
        return 'Failed to Create Workspace';
      case 'DELETE_WORKSPACE_FAILED':
        return 'Failed to Delete Workspace';
      case 'LOAD_SESSIONS_FAILED':
        return 'Failed to Load Sessions';
      case 'CREATE_SESSION_FAILED':
        return 'Failed to Create Session';
      case 'DELETE_SESSION_FAILED':
        return 'Failed to Delete Session';
      case 'CONNECTION_ERROR':
        return 'Connection Error';
      case 'NETWORK_ERROR':
        return 'Network Error';
      case 'UNAUTHORIZED':
        return 'Unauthorized Access';
      case 'FORBIDDEN':
        return 'Access Forbidden';
      case 'NOT_FOUND':
        return 'Resource Not Found';
      case 'SERVER_ERROR':
        return 'Server Error';
      default:
        return 'An Error Occurred';
    }
  };

  const getErrorSuggestion = (code: string) => {
    switch (code) {
      case 'CONNECTION_ERROR':
      case 'NETWORK_ERROR':
        return 'Please check your internet connection and try again.';
      case 'UNAUTHORIZED':
        return 'Please check your authentication credentials.';
      case 'FORBIDDEN':
        return 'You do not have permission to perform this action.';
      case 'NOT_FOUND':
        return 'The requested resource could not be found.';
      case 'SERVER_ERROR':
        return 'There was a problem with the server. Please try again later.';
      case 'LOAD_WORKSPACES_FAILED':
        return 'Check your API connection and ensure the orchestrator service is running.';
      case 'CREATE_WORKSPACE_FAILED':
        return 'Verify the workspace name is valid and the repository URL (if provided) is accessible.';
      case 'DELETE_WORKSPACE_FAILED':
        return 'The workspace may have active sessions. Try stopping all sessions first.';
      default:
        return 'Please try again or contact support if the problem persists.';
    }
  };

  return (
    <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-red-200 mb-1">
            {getErrorTitle(error.code)}
          </h3>
          <p className="text-sm text-red-300/80 mb-2">
            {error.message}
          </p>
          <p className="text-xs text-red-400/60 mb-3">
            {getErrorSuggestion(error.code)}
          </p>
          
          <div className="flex items-center gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-200 bg-red-800/50 hover:bg-red-800/70 rounded-md transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </button>
            )}
            
            {error.code && (
              <span className="text-xs text-red-400/40 font-mono">
                Error Code: {error.code}
              </span>
            )}
          </div>
        </div>
        
        {showDismiss && onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 text-red-400/60 hover:text-red-300 transition-colors"
            title="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
