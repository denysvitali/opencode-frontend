import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Always log error for debugging (even in production)
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);
    console.error('Component stack:', errorInfo.componentStack);
    console.error('Error stack:', error.stack);
    
    // Store error details in localStorage for mobile debugging
    try {
      const errorDetails = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href
      };
      localStorage.setItem('last-error-details', JSON.stringify(errorDetails, null, 2));
      console.log('Error details saved to localStorage for mobile debugging');
    } catch (e) {
      console.warn('Failed to save error details to localStorage:', e);
    }

    // In production, you could send this to an error reporting service
    // reportError(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Clear any persisted state that might be causing issues
    try {
      localStorage.removeItem('opencode-app-store');
      localStorage.removeItem('opencode-settings-store');
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
    }
    
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800 rounded-xl border border-gray-700 p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            
            <h1 className="text-xl font-semibold text-white mb-2">
              Something went wrong
            </h1>
            
            <p className="text-gray-400 mb-6">
              The application encountered an unexpected error. This has been logged for investigation.
            </p>

            {this.state.error && (
              <details className="mb-6 text-left bg-gray-900 rounded-lg p-4 border border-gray-600">
                <summary className="cursor-pointer text-red-400 text-sm font-medium mb-2">
                  Error Details (Click to expand)
                </summary>
                <div className="text-xs text-gray-300 space-y-2">
                  <div>
                    <strong className="text-red-400">Error:</strong>
                    <pre className="whitespace-pre-wrap overflow-auto mt-1">{this.state.error.toString()}</pre>
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong className="text-red-400">Stack Trace:</strong>
                      <pre className="whitespace-pre-wrap overflow-auto mt-1 max-h-32">{this.state.error.stack}</pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong className="text-red-400">Component Stack:</strong>
                      <pre className="whitespace-pre-wrap overflow-auto mt-1 max-h-32">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                  <div>
                    <strong className="text-red-400">URL:</strong>
                    <div className="mt-1 break-all">{window.location.href}</div>
                  </div>
                  <div>
                    <strong className="text-red-400">Timestamp:</strong>
                    <div className="mt-1">{new Date().toISOString()}</div>
                  </div>
                </div>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                <Home className="h-4 w-4" />
                Reset App
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
