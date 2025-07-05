import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.js';

interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'button' | 'dropdown';
}

export default function ThemeToggle({ className = '', variant = 'icon' }: ThemeToggleProps) {
  const { theme, actualTheme, setTheme, toggleTheme } = useTheme();

  const getIcon = () => {
    switch (actualTheme) {
      case 'dark':
        return <Moon className="h-5 w-5" />;
      case 'light':
        return <Sun className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'dark':
        return 'Dark mode';
      case 'light':
        return 'Light mode';
      case 'auto':
        return 'Auto mode';
      default:
        return 'Theme';
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`
          p-2 rounded-full transition-all duration-200
          hover:bg-gray-100 dark:hover:bg-gray-800
          active:scale-95 transform-gpu
          ${className}
        `}
        aria-label={`Switch theme. Current: ${getLabel()}`}
        title={getLabel()}
      >
        {getIcon()}
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-xl
          bg-gray-100 dark:bg-gray-800 
          hover:bg-gray-200 dark:hover:bg-gray-700
          transition-all duration-200 active:scale-95
          ${className}
        `}
        aria-label={`Switch theme. Current: ${getLabel()}`}
      >
        {getIcon()}
        <span className="text-sm font-medium">{getLabel()}</span>
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <div className="space-y-1">
          {(['light', 'dark', 'auto'] as const).map((themeOption) => (
            <button
              key={themeOption}
              onClick={() => setTheme(themeOption)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200 text-left
                ${theme === themeOption
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              {themeOption === 'light' && <Sun className="h-5 w-5" />}
              {themeOption === 'dark' && <Moon className="h-5 w-5" />}
              {themeOption === 'auto' && <Monitor className="h-5 w-5" />}
              <div>
                <p className="font-medium capitalize">{themeOption}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {themeOption === 'light' && 'Always use light theme'}
                  {themeOption === 'dark' && 'Always use dark theme'}
                  {themeOption === 'auto' && 'Follow system preference'}
                </p>
              </div>
              {theme === themeOption && (
                <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}