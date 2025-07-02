import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageCircle, Settings, Plus, Search } from 'lucide-react';
import { useUIStore } from '../../store/uiStore.js';

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

const defaultItems: BottomNavItem[] = [
  {
    id: 'home',
    label: 'Workspaces',
    icon: Home,
    path: '/',
    isActive: (path) => path === '/'
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: MessageCircle,
    isActive: (path) => path.includes('/workspace/') && path.includes('/session/')
  },
  {
    id: 'add',
    label: 'New',
    icon: Plus,
    action: () => console.log('Add action')
  },
  {
    id: 'search',
    label: 'Search',
    icon: Search,
    action: () => console.log('Search action')
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    isActive: (path) => path.startsWith('/settings')
  }
];

export function BottomNavigation({ 
  items = defaultItems, 
  onItemPress,
  className = '' 
}: BottomNavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile } = useUIStore();

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
    <nav className={`
      fixed bottom-0 left-0 right-0 z-50
      bg-gray-900/95 backdrop-blur-xl border-t border-gray-800
      safe-area-bottom
      ${className}
    `}>
      {/* Navigation Items */}
      <div className="flex items-center justify-around px-2 py-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item);
          
          return (
            <button
              key={item.id}
              onClick={() => handleItemPress(item)}
              className={`
                relative flex flex-col items-center justify-center
                min-h-[52px] min-w-[52px] px-2 py-1
                rounded-xl transition-all duration-200
                ${isActive 
                  ? 'text-blue-400 bg-blue-400/10' 
                  : 'text-gray-400 hover:text-gray-300 active:bg-gray-800/50'
                }
                active:scale-95
              `}
              aria-label={item.label}
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
  );
}

export default BottomNavigation;