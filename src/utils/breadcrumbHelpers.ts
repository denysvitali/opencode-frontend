import { Home, Folder, MessageCircle } from 'lucide-react';
import type { BreadcrumbItem } from '../components/ui/BreadcrumbNavigation.js';

// Helper function to create common breadcrumb patterns
export const createWorkspaceBreadcrumbs = (
  workspaceName: string,
  sessionName?: string,
  onNavigateToWorkspaces?: () => void,
  onNavigateToWorkspace?: () => void,
  onNavigateToSession?: () => void
): BreadcrumbItem[] => {
  const items: BreadcrumbItem[] = [
    {
      id: 'workspaces',
      label: 'Workspaces',
      icon: Home,
      onClick: onNavigateToWorkspaces
    },
    {
      id: 'workspace',
      label: workspaceName,
      icon: Folder,
      onClick: onNavigateToWorkspace,
      isActive: !sessionName
    }
  ];

  if (sessionName) {
    items.push({
      id: 'session',
      label: sessionName,
      icon: MessageCircle,
      onClick: onNavigateToSession,
      isActive: true
    });
  }

  return items;
};

// Example usage for different navigation scenarios
export const useBreadcrumbHelpers = () => {
  const createWorkspaceListBreadcrumbs = (): BreadcrumbItem[] => [
    {
      id: 'workspaces',
      label: 'Workspaces',
      icon: Home,
      isActive: true
    }
  ];

  const createWorkspaceViewBreadcrumbs = (
    workspaceName: string,
    onNavigateToWorkspaces?: () => void
  ): BreadcrumbItem[] => [
    {
      id: 'workspaces',
      label: 'Workspaces',
      icon: Home,
      onClick: onNavigateToWorkspaces
    },
    {
      id: 'workspace',
      label: workspaceName,
      icon: Folder,
      isActive: true
    }
  ];

  const createSessionBreadcrumbs = (
    workspaceName: string,
    sessionName: string,
    onNavigateToWorkspaces?: () => void,
    onNavigateToWorkspace?: () => void
  ): BreadcrumbItem[] => [
    {
      id: 'workspaces',
      label: 'Workspaces',
      icon: Home,
      onClick: onNavigateToWorkspaces
    },
    {
      id: 'workspace',
      label: workspaceName,
      icon: Folder,
      onClick: onNavigateToWorkspace
    },
    {
      id: 'session',
      label: sessionName,
      icon: MessageCircle,
      isActive: true
    }
  ];

  return {
    createWorkspaceListBreadcrumbs,
    createWorkspaceViewBreadcrumbs,
    createSessionBreadcrumbs
  };
};
