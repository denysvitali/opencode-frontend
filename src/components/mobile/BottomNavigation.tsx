import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Code, Plus, Search, Menu, FolderOpen } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore.js';
import MobileMenu from './MobileMenu.js';
import MobileSearch from './MobileSearch.js';

interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  action?: () => void;
  badge?: number;
  isActive?: (path: string) => boolean;
  variant?: 'default' | 'primary';
}

interface BottomNavigationProps {
  items?: BottomNavItem[];
  onItemPress?: (item: BottomNavItem) => void;
  className?: string;
}

const getContextualItems = (currentPath: string, navigate: (path: string) => void, onMenuOpen: () => void, onSearchOpen: () => void, onNewAction: () => void): BottomNavItem[] => {
  const baseItems: BottomNavItem[] = [
    {
      id: 'workspaces',
      label: 'Workspaces',
      icon: FolderOpen,
      path: '/',
      isActive: (path) => path === '/'
    }
  ];

  // Add contextual navigation based on current path
  if (currentPath.includes('/workspace/') && currentPath.includes('/session/')) {
    // In chat session - show workspace sessions
    baseItems.push({
      id: 'sessions',
      label: 'Sessions',
      icon: Code,
      action: () => {
        const workspaceId = currentPath.split('/')[2];
        navigate(`/workspace/${workspaceId}`);
      },
      isActive: () => false
    });
  } else if (currentPath.includes('/workspace/')) {
    // In workspace sessions - show code/terminal toggle
    baseItems.push({
      id: 'code',
      label: 'Code',
      icon: Code,
      action: () => {
        // Toggle to code view or similar contextual action
        console.log('Show code view');
      },
      isActive: () => false
    });
  } else {
    // Default - show menu
    baseItems.push({
      id: 'menu',
      label: 'Menu',
      icon: Menu,
      action: onMenuOpen,
      isActive: () => false
    });
  }

  // Add contextual "New" button
  let newButtonLabel = 'New';
  if (currentPath === '/') {
    newButtonLabel = 'New';
  } else if (currentPath.includes('/workspace/') && !currentPath.includes('/session/')) {
    newButtonLabel = 'New';
  } else if (currentPath.includes('/session/')) {
    newButtonLabel = 'New';
  }

  // Add remaining items
  baseItems.push(
    {
      id: 'add',
      label: newButtonLabel,
      icon: Plus,
      action: onNewAction,
      variant: 'primary'
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      action: onSearchOpen
    }
  );

  return baseItems;
};

export function BottomNavigation({ 
  items, 
  onItemPress,
  className = '' 
}: BottomNavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile } = useUIStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleNewAction = () => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    // Context-based new actions
    if (location.pathname === '/') {
      // On workspaces page - create new workspace
      console.log('Create new workspace');
    } else if (location.pathname.includes('/workspace/') && !location.pathname.includes('/session/')) {
      // In workspace - create new session
      const workspaceId = location.pathname.split('/')[2];
      navigate(`/workspace/${workspaceId}/new-session`);
    } else if (location.pathname.includes('/session/')) {
      // In session - create new chat/message
      console.log('Create new chat');
    }
  };

  // Use contextual items if no items provided
  const contextualItems = items || getContextualItems(location.pathname, navigate, () => setIsMenuOpen(true), () => setIsSearchOpen(true), handleNewAction);

  // Only show on mobile
  if (!isMobile) {
    return null;
  }

  const handleItemPress = (item: BottomNavItem) => {
    // Haptic feedback for supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }

    onItemPress?.(item);
  };

  const isItemActive = (item: BottomNavItem): boolean => {
    if (item.isActive) {
      return item.isActive(location.pathname);
    }
    if (item.path) {
      return location.pathname === item.path;
    }
    return false;
  };

  return (
    <>
      <nav 
        className={`
          fixed bottom-0 left-0 right-0 z-50
          bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700
          safe-area-bottom
          ${className}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Navigation Items */}
        <div className="flex items-center justify-around px-4 py-2" role="tablist">
          {contextualItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = isItemActive(item);
            const isPrimary = item.variant === 'primary';
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemPress(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleItemPress(item);
                  }
                  // Arrow key navigation
                  if (e.key === 'ArrowLeft' && index > 0) {
                    e.preventDefault();
                    const prevButton = e.currentTarget.parentElement?.children[index - 1] as HTMLButtonElement;
                    prevButton?.focus();
                  }
                  if (e.key === 'ArrowRight' && index < contextualItems.length - 1) {
                    e.preventDefault();
                    const nextButton = e.currentTarget.parentElement?.children[index + 1] as HTMLButtonElement;
                    nextButton?.focus();
                  }
                }}
                className={`
                  relative flex flex-col items-center justify-center
                  min-h-[56px] min-w-[56px] px-3 py-2
                  rounded-2xl transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isPrimary 
                    ? 'bg-blue-600 text-white shadow-lg active:scale-95' 
                    : isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700'
                  }
                  active:scale-95
                `}
                aria-label={`${item.label}${isActive ? ' (current)' : ''}`}
                aria-pressed={isActive}
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
              >
                {/* Icon */}
                <Icon className={`
                  h-6 w-6 mb-1
                  ${isPrimary ? 'text-white' : ''}
                  transition-transform duration-200
                `} />
                
                {/* Badge for notifications */}
                {item.badge && item.badge > 0 && (
                  <span className="
                    absolute -top-1 -right-1
                    bg-red-500 text-white text-xs
                    rounded-full min-w-[18px] h-[18px]
                    flex items-center justify-center
                    font-medium text-[10px]
                  ">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
                
                {/* Label */}
                <span className={`
                  text-xs font-medium leading-none
                  ${isPrimary ? 'text-white' : ''}
                `}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
      
      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
      
      {/* Mobile Search */}
      <MobileSearch 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}

export default BottomNavigation;