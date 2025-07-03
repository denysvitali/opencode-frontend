import { useEffect, useRef, useCallback } from 'react';

interface UseAccessibilityOptions {
  // Focus management
  autoFocus?: boolean;
  trapFocus?: boolean;
  restoreFocus?: boolean;
  
  // Keyboard navigation
  enableArrowNavigation?: boolean;
  enableEscapeKey?: boolean;
  
  // Screen reader announcements
  announceChanges?: boolean;
}

export function useAccessibility(options: UseAccessibilityOptions = {}) {
  const {
    autoFocus = false,
    trapFocus = false,
    restoreFocus = false,
    enableArrowNavigation = false,
    enableEscapeKey = false,
    announceChanges = false
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Store the previously focused element when component mounts
  useEffect(() => {
    if (restoreFocus) {
      previousActiveElement.current = document.activeElement;
    }
  }, [restoreFocus]);

  // Auto focus first focusable element
  useEffect(() => {
    if (autoFocus && containerRef.current) {
      const focusableElement = getFocusableElements(containerRef.current)[0];
      if (focusableElement) {
        focusableElement.focus();
      }
    }
  }, [autoFocus]);

  // Restore focus when component unmounts
  useEffect(() => {
    return () => {
      if (restoreFocus && previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [restoreFocus]);

  // Focus trap implementation
  useEffect(() => {
    if (!trapFocus || !containerRef.current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements(containerRef.current!);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [trapFocus]);

  // Arrow key navigation
  const handleArrowNavigation = useCallback((event: KeyboardEvent) => {
    if (!enableArrowNavigation || !containerRef.current) return;

    const focusableElements = getFocusableElements(containerRef.current);
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);

    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % focusableElements.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = focusableElements.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    focusableElements[nextIndex]?.focus();
  }, [enableArrowNavigation]);

  // Escape key handler
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && enableEscapeKey) {
      // Default escape behavior - can be overridden
      if (restoreFocus && previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    }
  }, [enableEscapeKey, restoreFocus]);

  // Set up keyboard event listeners
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    if (enableArrowNavigation) {
      container.addEventListener('keydown', handleArrowNavigation);
    }

    if (enableEscapeKey) {
      container.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      if (enableArrowNavigation) {
        container.removeEventListener('keydown', handleArrowNavigation);
      }
      if (enableEscapeKey) {
        container.removeEventListener('keydown', handleEscapeKey);
      }
    };
  }, [enableArrowNavigation, enableEscapeKey, handleArrowNavigation, handleEscapeKey]);

  // Announce changes to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceChanges) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove the announcement after a short delay
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, [announceChanges]);

  return {
    containerRef,
    announce
  };
}

// Helper function to get all focusable elements
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
}

// Hook for managing live regions
export function useLiveRegion() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const liveRegion = document.getElementById(`live-region-${priority}`) || createLiveRegion(priority);
    liveRegion.textContent = message;

    // Clear the message after announcing
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }, []);

  return { announce };
}

function createLiveRegion(priority: 'polite' | 'assertive'): HTMLElement {
  const liveRegion = document.createElement('div');
  liveRegion.id = `live-region-${priority}`;
  liveRegion.setAttribute('aria-live', priority);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  document.body.appendChild(liveRegion);
  return liveRegion;
}