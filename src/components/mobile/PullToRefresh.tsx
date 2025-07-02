import React, { useState, useRef, useCallback, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  maxPullDistance?: number;
  disabled?: boolean;
}

export function PullToRefresh({
  onRefresh,
  children,
  className = '',
  threshold = 60,
  maxPullDistance = 120,
  disabled = false
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  
  const startY = useRef(0);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    // Only trigger if we're at the top of the scrollable area
    if (container.scrollTop > 0) return;
    
    startY.current = e.touches[0].clientY;
    isDragging.current = true;
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging.current || disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) {
      isDragging.current = false;
      setPullDistance(0);
      setCanRefresh(false);
      return;
    }

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);
    
    // Apply resistance to the pull
    const resistance = 0.5;
    const adjustedDistance = Math.min(distance * resistance, maxPullDistance);
    
    setPullDistance(adjustedDistance);
    setCanRefresh(adjustedDistance >= threshold);
    
    // Prevent default scrolling when pulling
    if (distance > 10) {
      e.preventDefault();
    }
  }, [disabled, isRefreshing, threshold, maxPullDistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!isDragging.current) return;
    
    isDragging.current = false;
    
    if (canRefresh && !isRefreshing && !disabled) {
      setIsRefreshing(true);
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    setCanRefresh(false);
  }, [canRefresh, isRefreshing, disabled, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const getRefreshIndicatorStyle = () => {
    const progress = Math.min(pullDistance / threshold, 1);
    const scale = 0.6 + (progress * 0.4);
    const opacity = Math.min(progress, 1);
    const rotation = isRefreshing ? 'animate-spin' : `rotate-${Math.floor(progress * 180)}`;
    
    return {
      transform: `translateY(${pullDistance}px) scale(${scale})`,
      opacity,
      className: rotation
    };
  };

  const indicatorStyle = getRefreshIndicatorStyle();

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      style={{ transform: `translateY(${isRefreshing ? threshold : pullDistance}px)` }}
    >
      {/* Pull to refresh indicator */}
      <div 
        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full z-10"
        style={{ 
          transform: `translateX(-50%) ${indicatorStyle.transform}`,
          opacity: indicatorStyle.opacity 
        }}
      >
        <div className={`
          flex items-center justify-center
          w-12 h-12
          bg-gray-800 border border-gray-700
          rounded-full shadow-lg
          ${isRefreshing ? 'bg-blue-600 border-blue-500' : ''}
          ${canRefresh ? 'bg-blue-600 border-blue-500' : ''}
          transition-colors duration-200
        `}>
          <RefreshCw className={`
            h-5 w-5
            ${isRefreshing ? 'text-white animate-spin' : ''}
            ${canRefresh ? 'text-white' : 'text-gray-400'}
            ${!isRefreshing && canRefresh ? 'rotate-180' : ''}
            transition-all duration-200
          `} />
        </div>
        
        {/* Status text */}
        <div className="text-center mt-2">
          <p className={`
            text-xs font-medium
            ${isRefreshing ? 'text-blue-400' : ''}
            ${canRefresh ? 'text-blue-400' : 'text-gray-500'}
            transition-colors duration-200
          `}>
            {isRefreshing 
              ? 'Refreshing...' 
              : canRefresh 
                ? 'Release to refresh' 
                : 'Pull to refresh'
            }
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className={`
        transition-transform duration-300 ease-out
        ${isRefreshing ? 'transform translate-y-16' : ''}
      `}>
        {children}
      </div>
    </div>
  );
}

export default PullToRefresh;