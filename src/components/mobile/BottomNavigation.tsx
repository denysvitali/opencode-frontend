import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Settings, Plus, Search, Menu, ArrowLeft } from 'lucide-react';
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
}

interface BottomNavigationProps {
  items?: BottomNavItem[];
  onItemPress?: (item: BottomNavItem) => void;
  className?: string;
}

const getContextualItems = (currentPath: string, navigate: (path: string) => void, onMenuOpen: () => void, onSearchOpen: () => void, onNewAction: () => void): BottomNavItem[] => {
  const baseItems: BottomNavItem[] = [
    {
      id: 'home',
      label: 'Workspaces',
      icon: Home,
      path: '/',
      isActive: (path) => path === '/'
    }
  ];

  // Add contextual navigation based on current path
  if (currentPath.includes('/workspace/') && currentPath.includes('/session/')) {
    // In chat session - show back to sessions
    baseItems.push({
      id: 'back',
      label: 'Sessions',
      icon: ArrowLeft,
      action: () => {
        const workspaceId = currentPath.split('/')[2];
        navigate(`/workspace/${workspaceId}`);
      },
      isActive: () => false
    });
  } else if (currentPath.includes('/workspace/')) {
    // In workspace sessions - show menu/hamburger
    baseItems.push({
      id: 'menu',
      label: 'Menu',
      icon: Menu,
      action: onMenuOpen,
      isActive: () => true
    });
  } else {
    // Default navigation item
    baseItems.push({
      id: 'navigation',
      label: 'Menu',
      icon: Menu,
      action: onMenuOpen,
      isActive: () => false
    });
  }

  // Add contextual "New" button
  let newButtonLabel = 'New';
  if (currentPath === '/') {
    newButtonLabel = 'New Workspace';
  } else if (currentPath.includes('/workspace/') && !currentPath.includes('/session/')) {
    newButtonLabel = 'New Session';
  } else if (currentPath.includes('/session/')) {
    newButtonLabel = 'New Chat';
  }

  // Add remaining items
  baseItems.push(
    {
      id: 'add',
      label: newButtonLabel,
      icon: Plus,
      action: onNewAction
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      action: onSearchOpen
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      isActive: (path) => path.startsWith('/settings')
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
      // This could trigger a workspace creation modal
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
          bg-gray-900/95 backdrop-blur-xl border-t border-gray-800
          safe-area-bottom
          ${className}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
      {/* Navigation Items */}
      <div className="flex items-center justify-around px-3 py-2" role="tablist">
        {contextualItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = isItemActive(item);
          
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
                min-h-[52px] min-w-[52px] px-3 py-2
                rounded-xl transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
                ${isActive 
                  ? 'text-blue-400 bg-blue-400/10' 
                  : 'text-gray-400 hover:text-gray-300 active:bg-gray-800/50'
                }
                active:scale-95
              `}
              aria-label={`${item.label}${isActive ? ' (current)' : ''}`}
              aria-pressed={isActive}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
            >
              {/* Icon with special styling for Add button */}
              <div className={`
                relative flex items-center justify-center
                ${item.id === 'add' 
                  ? 'bg-blue-600 rounded-full p-2 mb-1' 
                  : 'mb-1'
                }
              `}>
                <Icon className={`
                  h-5 w-5
                  ${item.id === 'add' ? 'text-white' : ''}
                  ${isActive && item.id !== 'add' ? 'scale-110' : ''}
                  transition-transform duration-200
                `} />
                
                {/* Badge for notifications */}
                {item.badge && item.badge > 0 && (
                  <span className="
                    absolute -top-1 -right-1
                    bg-red-500 text-white text-xs
                    rounded-full min-w-[16px] h-4
                    flex items-center justify-center
                    font-medium
                  ">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              
              {/* Label */}
              <span className={`
                text-xs font-medium leading-none
                ${item.id === 'add' ? 'text-blue-400' : ''}
                ${isActive && item.id !== 'add' ? 'text-blue-400' : ''}
              `}>
                {item.label}
              </span>
              
              {/* Active indicator */}
              {isActive && item.id !== 'add' && (
                <div className="
                  absolute top-0 left-1/2 transform -translate-x-1/2
                  w-6 h-0.5 bg-blue-400 rounded-full
                " />
              )}
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