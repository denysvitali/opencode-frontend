import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  isActive?: boolean;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  maxItems?: number;
  className?: string;
}

export default function BreadcrumbNavigation({ 
  items, 
  maxItems = 4,
  className = ""
}: BreadcrumbNavigationProps) {
  // Collapse items if there are too many
  const displayItems = items.length > maxItems 
    ? [
        items[0], // Always show first item (home)
        { id: 'ellipsis', label: '...', isActive: false },
        ...items.slice(-(maxItems - 2)) // Show last few items
      ]
    : items;

  return (
    <nav className={`flex items-center space-x-1 text-base ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {displayItems.map((item, index) => {
          const Icon = item.icon;
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.id === 'ellipsis';
          
          return (
            <li key={item.id} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 mx-1" />
              )}
              
              {isEllipsis ? (
                <span className="text-gray-500 dark:text-gray-400 px-2">...</span>
              ) : (
                <button
                  onClick={item.onClick}
                  disabled={!item.onClick || item.isActive}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg 
                    transition-all duration-200 ease-out
                    transform-gpu will-change-transform
                    hover:scale-105 active:scale-95
                    ${
                      item.isActive || isLast
                        ? 'text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 cursor-default shadow-sm'
                        : item.onClick
                          ? 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
                          : 'text-gray-400 dark:text-gray-500 cursor-default'
                    }
                  `}
                  aria-current={item.isActive || isLast ? 'page' : undefined}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  <span className="truncate max-w-32 font-medium">{item.label}</span>
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
