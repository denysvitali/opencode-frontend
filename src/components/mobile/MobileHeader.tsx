import React from 'react';
import { ArrowLeft, MoreVertical, Search, Menu, X } from 'lucide-react';

interface MobileHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  onMenu?: () => void;
  onSearch?: () => void;
  onMore?: () => void;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  showSearchButton?: boolean;
  showMoreButton?: boolean;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'transparent' | 'minimal';
}

export function MobileHeader({
  title,
  subtitle,
  onBack,
  onMenu,
  onSearch,
  onMore,
  showBackButton = false,
  showMenuButton = false,
  showSearchButton = false,
  showMoreButton = false,
  leftContent,
  rightContent,
  centerContent,
  className = '',
  variant = 'default'
}: MobileHeaderProps) {
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'transparent':
        return 'bg-transparent border-transparent';
      case 'minimal':
        return 'bg-gray-900/80 backdrop-blur-md border-gray-800/50';
      default:
        return 'bg-gray-900 border-gray-800';
    }
  };

  const handleButtonPress = (action?: () => void) => {
    // Haptic feedback for supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    action?.();
  };

  return (
    <header className={`
      sticky top-0 z-40
      ${getVariantStyles()}
      border-b
      safe-area-top
      ${className}
    `}>
      <div className="flex items-center h-14 px-4">
        {/* Left Section */}
        <div className="flex items-center flex-shrink-0">
          {leftContent || (
            <>
              {showBackButton && (
                <button
                  onClick={() => handleButtonPress(onBack)}
                  className="
                    flex items-center justify-center
                    w-10 h-10 -ml-2
                    text-gray-300 hover:text-white
                    rounded-full active:bg-gray-800
                    transition-all duration-150
                  "
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              
              {showMenuButton && (
                <button
                  onClick={() => handleButtonPress(onMenu)}
                  className="
                    flex items-center justify-center
                    w-10 h-10 -ml-2
                    text-gray-300 hover:text-white
                    rounded-full active:bg-gray-800
                    transition-all duration-150
                  "
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Center Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 min-w-0">
          {centerContent || (
            <>
              {title && (
                <h1 className="
                  text-lg font-semibold text-white
                  truncate max-w-full
                ">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="
                  text-sm text-gray-400
                  truncate max-w-full
                  -mt-0.5
                ">
                  {subtitle}
                </p>
              )}
            </>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center flex-shrink-0 space-x-1">
          {rightContent || (
            <>
              {showSearchButton && (
                <button
                  onClick={() => handleButtonPress(onSearch)}
                  className="
                    flex items-center justify-center
                    w-10 h-10
                    text-gray-300 hover:text-white
                    rounded-full active:bg-gray-800
                    transition-all duration-150
                  "
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
              
              {showMoreButton && (
                <button
                  onClick={() => handleButtonPress(onMore)}
                  className="
                    flex items-center justify-center
                    w-10 h-10
                    text-gray-300 hover:text-white
                    rounded-full active:bg-gray-800
                    transition-all duration-150
                  "
                  aria-label="More options"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default MobileHeader;