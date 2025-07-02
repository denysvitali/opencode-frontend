import React from 'react';
import { Loader2, WifiOff } from 'lucide-react';

interface MobileLoaderProps {
  type?: 'spinner' | 'skeleton' | 'dots' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  showProgress?: boolean;
  progress?: number;
  isOffline?: boolean;
  className?: string;
}

export function MobileLoader({
  type = 'spinner',
  size = 'md',
  message,
  showProgress = false,
  progress = 0,
  isOffline = false,
  className = ''
}: MobileLoaderProps) {
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-8 w-8';
      default:
        return 'h-6 w-6';
    }
  };

  const renderSpinner = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 className={`${getSizeClasses()} animate-spin text-blue-400`} />
      {message && (
        <p className="text-sm text-gray-400 text-center max-w-xs">
          {message}
        </p>
      )}
      {showProgress && (
        <div className="w-32 bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
      {isOffline && (
        <div className="flex items-center space-x-2 text-orange-400">
          <WifiOff className="h-4 w-4" />
          <span className="text-xs">Working offline</span>
        </div>
      )}
    </div>
  );

  const renderSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      <div className="h-4 bg-gray-700 rounded w-5/6"></div>
    </div>
  );

  const renderDots = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      {message && (
        <p className="text-sm text-gray-400 text-center max-w-xs">
          {message}
        </p>
      )}
    </div>
  );

  const renderPulse = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`${getSizeClasses()} bg-blue-400 rounded-full animate-pulse`} />
      {message && (
        <p className="text-sm text-gray-400 text-center max-w-xs animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  const renderLoader = () => {
    switch (type) {
      case 'skeleton':
        return renderSkeleton();
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      {renderLoader()}
    </div>
  );
}

// Skeleton components for specific UI elements
export function WorkspaceCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-5 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-full"></div>
        </div>
        <div className="w-6 h-6 bg-gray-700 rounded ml-3"></div>
      </div>
      
      <div className="h-6 bg-gray-700 rounded-full w-20 mb-3"></div>
      
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          <div className="h-4 bg-gray-700 rounded w-16"></div>
          <div className="h-4 bg-gray-700 rounded w-12"></div>
        </div>
        <div className="h-4 bg-gray-700 rounded w-16"></div>
      </div>
    </div>
  );
}

export function ChatMessageSkeleton({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className="max-w-[85%] animate-pulse">
        {!isUser && (
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 bg-gray-700 rounded-full mr-2"></div>
            <div className="h-3 bg-gray-700 rounded w-16"></div>
          </div>
        )}
        
        <div className={`
          px-4 py-3 rounded-2xl
          ${isUser ? 'bg-gray-600 rounded-br-md' : 'bg-gray-700 rounded-bl-md'}
        `}>
          <div className="space-y-2">
            <div className="h-4 bg-gray-600 rounded w-full"></div>
            <div className="h-4 bg-gray-600 rounded w-3/4"></div>
          </div>
          <div className="h-3 bg-gray-600 rounded w-12 mt-2"></div>
        </div>
      </div>
    </div>
  );
}

export function NavigationSkeleton() {
  return (
    <div className="flex items-center justify-around px-2 py-1 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex flex-col items-center space-y-1">
          <div className="w-6 h-6 bg-gray-700 rounded"></div>
          <div className="w-8 h-3 bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
  );
}

export default MobileLoader;