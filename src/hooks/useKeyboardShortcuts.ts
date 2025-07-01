import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

export interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
  target?: HTMLElement | Window;
}

/**
 * Hook for managing keyboard shortcuts
 */
export function useKeyboardShortcuts({ 
  shortcuts, 
  enabled = true, 
  target = window 
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback((event: Event) => {
    if (!enabled) return;

    // Type guard to ensure we have a KeyboardEvent
    if (!(event instanceof KeyboardEvent)) return;

    // Don't trigger shortcuts when user is typing in inputs
    const activeElement = document.activeElement;
    if (activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      (activeElement as HTMLElement).contentEditable === 'true'
    )) {
      return;
    }

    for (const shortcut of shortcuts) {
      const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const matchesMeta = (shortcut.metaKey ?? false) === event.metaKey;
      const matchesCtrl = (shortcut.ctrlKey ?? false) === event.ctrlKey;
      const matchesShift = (shortcut.shiftKey ?? false) === event.shiftKey;
      const matchesAlt = (shortcut.altKey ?? false) === event.altKey;

      if (matchesKey && matchesMeta && matchesCtrl && matchesShift && matchesAlt) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
          event.stopPropagation();
        }
        shortcut.action();
        break;
      }
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const targetElement = target instanceof Window ? window : target;
    targetElement.addEventListener('keydown', handleKeyDown);

    return () => {
      targetElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [target, handleKeyDown, enabled]);

  return {
    shortcuts,
    enabled
  };
}

/**
 * Common keyboard shortcuts for workspace management
 */
export function useWorkspaceKeyboardShortcuts({
  onOpenWorkspaceSwitcher,
  onOpenSearch,
  onCreateWorkspace,
  onRefresh,
  enabled = true
}: {
  onOpenWorkspaceSwitcher?: () => void;
  onOpenSearch?: () => void;
  onCreateWorkspace?: () => void;
  onRefresh?: () => void;
  enabled?: boolean;
}) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'k',
      metaKey: true,
      action: () => onOpenWorkspaceSwitcher?.(),
      description: 'Open workspace switcher'
    },
    {
      key: 'k',
      ctrlKey: true,
      action: () => onOpenWorkspaceSwitcher?.(),
      description: 'Open workspace switcher (Ctrl+K)'
    },
    {
      key: '/',
      action: () => onOpenSearch?.(),
      description: 'Focus search',
      preventDefault: false
    },
    {
      key: 'n',
      metaKey: true,
      action: () => onCreateWorkspace?.(),
      description: 'Create new workspace'
    },
    {
      key: 'n',
      ctrlKey: true,
      action: () => onCreateWorkspace?.(),
      description: 'Create new workspace (Ctrl+N)'
    },
    {
      key: 'r',
      metaKey: true,
      action: () => onRefresh?.(),
      description: 'Refresh workspace list'
    },
    {
      key: 'F5',
      action: () => onRefresh?.(),
      description: 'Refresh workspace list (F5)'
    }
  ].filter(shortcut => shortcut.action !== undefined);

  return useKeyboardShortcuts({ shortcuts, enabled });
}

/**
 * Hook for handling escape key to close modals/overlays
 */
export function useEscapeKey(onEscape: () => void, enabled = true) {
  return useKeyboardShortcuts({
    shortcuts: [{
      key: 'Escape',
      action: onEscape,
      description: 'Close modal/overlay'
    }],
    enabled
  });
}

/**
 * Hook for navigation shortcuts (arrow keys, enter, etc.)
 */
export function useNavigationShortcuts({
  onMoveUp,
  onMoveDown,
  onSelect,
  onBack,
  enabled = true
}: {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onSelect?: () => void;
  onBack?: () => void;
  enabled?: boolean;
}) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'ArrowUp',
      action: () => onMoveUp?.(),
      description: 'Move selection up'
    },
    {
      key: 'ArrowDown',
      action: () => onMoveDown?.(),
      description: 'Move selection down'
    },
    {
      key: 'Enter',
      action: () => onSelect?.(),
      description: 'Select item'
    },
    {
      key: 'Backspace',
      action: () => onBack?.(),
      description: 'Go back'
    }
  ].filter(shortcut => shortcut.action !== undefined);

  return useKeyboardShortcuts({ shortcuts, enabled });
}

/**
 * Utility function to format keyboard shortcut for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  
  if (shortcut.metaKey) {
    parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
  }
  if (shortcut.ctrlKey && !shortcut.metaKey) {
    parts.push('Ctrl');
  }
  if (shortcut.shiftKey) {
    parts.push('⇧');
  }
  if (shortcut.altKey) {
    parts.push(navigator.platform.includes('Mac') ? '⌥' : 'Alt');
  }
  
  // Format special keys
  let key = shortcut.key;
  switch (key.toLowerCase()) {
    case 'arrowup':
      key = '↑';
      break;
    case 'arrowdown':
      key = '↓';
      break;
    case 'arrowleft':
      key = '←';
      break;
    case 'arrowright':
      key = '→';
      break;
    case ' ':
      key = 'Space';
      break;
    case 'escape':
      key = 'Esc';
      break;
    case 'backspace':
      key = '⌫';
      break;
    case 'enter':
      key = '↵';
      break;
    default:
      key = key.toUpperCase();
  }
  
  parts.push(key);
  
  return parts.join(navigator.platform.includes('Mac') ? '' : '+');
}

export default useKeyboardShortcuts;
