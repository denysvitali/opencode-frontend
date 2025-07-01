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
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {displayItems.map((item, index) => {
          const Icon = item.icon;
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.id === 'ellipsis';
          
          return (
            <li key={item.id} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-500 mx-1" />
              )}
              
              {isEllipsis ? (
                <span className="text-gray-500">...</span>
              ) : (
                <button
                  onClick={item.onClick}
                  disabled={!item.onClick || item.isActive}
                  className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                    item.isActive || isLast
                      ? 'text-white bg-gray-700 cursor-default'
                      : item.onClick
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                        : 'text-gray-400 cursor-default'
                  }`}
                  aria-current={item.isActive || isLast ? 'page' : undefined}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span className="truncate max-w-32">{item.label}</span>
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
