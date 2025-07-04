import React from 'react';
import { 
  Home, 
  Settings, 
  User, 
  HelpCircle, 
  Info, 
  LogOut,
  X,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore.js';
import { useAppStore } from '../../stores/appStore.js';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  action?: () => void;
  divider?: boolean;
  danger?: boolean;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const navigate = useNavigate();
  const { isMobile } = useUIStore();
  const { user, setUser } = useAppStore();

  const menuItems: MenuItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile'
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      path: '/help',
      divider: true
    },
    {
      id: 'about',
      label: 'About',
      icon: Info,
      path: '/about'
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: LogOut,
      action: () => {
        setUser(null);
        navigate('/');
      },
      danger: true,
      divider: true
    }
  ];

  const handleItemPress = (item: MenuItem) => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }

    onClose();
  };

  // Don't render on desktop
  if (!isMobile) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Menu Panel */}
      <div 
        className={`
          fixed top-0 right-0 bottom-0 z-50
          w-80 max-w-[85vw]
          bg-gray-900 border-l border-gray-800
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          safe-area-top safe-area-bottom
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">
                {user?.name || 'User'}
              </h2>
              <p className="text-sm text-gray-400">
                {user?.name ? `${user.name.toLowerCase()}@example.com` : 'user@example.com'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <React.Fragment key={item.id}>
                {item.divider && (
                  <div className="h-px bg-gray-800 my-4" />
                )}
                <button
                  onClick={() => handleItemPress(item)}
                  className={`
                    w-full flex items-center gap-3 p-3
                    rounded-lg transition-colors
                    ${item.danger 
                      ? 'text-red-400 hover:bg-red-400/10' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
                  `}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium flex-1 text-left">
                    {item.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="text-center text-xs text-gray-500">
            OpenCode v1.0.0
          </div>
        </div>
      </div>
    </>
  );
}

export default MobileMenu;