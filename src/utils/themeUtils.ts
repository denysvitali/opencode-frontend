/**
 * Semantic CSS utilities for consistent theming across light and dark modes.
 * These utilities map semantic intentions to theme-aware classes.
 */

// Background utilities
export const bg = {
  // Primary backgrounds (main content areas)
  primary: 'bg-background-primary',
  secondary: 'bg-background-secondary', 
  tertiary: 'bg-background-tertiary',
  
  // Surface backgrounds (cards, panels, etc.)
  surface: 'bg-surface-primary',
  surfaceSecondary: 'bg-surface-secondary',
  surfaceTertiary: 'bg-surface-tertiary',
  
  // Interactive states
  hover: 'hover:bg-surface-secondary',
  active: 'active:bg-surface-tertiary',
  
  // Brand colors - vibrant and consistent
  brand: 'bg-blue-600',
  brandHover: 'hover:bg-blue-700',
  brandActive: 'active:bg-blue-800',
  
  // Status colors (vibrant and accessible)
  success: 'bg-emerald-600',
  warning: 'bg-amber-500', 
  error: 'bg-red-600',
  info: 'bg-blue-600',
  
  // Status with opacity for subtle backgrounds
  successSoft: 'bg-emerald-50 dark:bg-emerald-900/20',
  warningSoft: 'bg-amber-50 dark:bg-amber-900/20',
  errorSoft: 'bg-red-50 dark:bg-red-900/20',
  infoSoft: 'bg-blue-50 dark:bg-blue-900/20',
  
  // Workspace-specific backgrounds
  workspace: 'bg-gradient-to-br from-surface-primary to-surface-secondary',
  workspaceHeader: 'bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900',
} as const;

// Text utilities
export const text = {
  // Text hierarchy
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
  tertiary: 'text-text-tertiary',
  inverse: 'text-text-inverse',
  
  // Brand colors
  brand: 'text-blue-600 dark:text-blue-400',
  brandHover: 'hover:text-blue-700 dark:hover:text-blue-300',
  
  // Status colors (vibrant and accessible)
  success: 'text-emerald-700 dark:text-emerald-400',
  warning: 'text-amber-700 dark:text-amber-400',
  error: 'text-red-700 dark:text-red-400',
  info: 'text-blue-700 dark:text-blue-400',
  
  // Interactive states
  hover: 'hover:text-text-primary',
  active: 'active:text-text-primary',
  
  // Special text styles
  muted: 'text-text-tertiary',
  emphasis: 'text-text-primary font-medium',
} as const;

// Border utilities
export const border = {
  primary: 'border-border-primary',
  secondary: 'border-border-secondary',
  
  // Status borders
  success: 'border-green-600',
  warning: 'border-yellow-600',
  error: 'border-red-600',
  info: 'border-blue-600',
  
  // Interactive states
  hover: 'hover:border-border-secondary',
  focus: 'focus:border-blue-500',
} as const;

// Common component patterns
export const card = {
  base: `${bg.surface} ${border.primary} ${text.primary} border rounded-lg`,
  hover: `${bg.surface} ${border.primary} ${text.primary} border rounded-lg ${bg.hover} transition-colors`,
  interactive: `${bg.surface} ${border.primary} ${text.primary} border rounded-lg ${bg.hover} ${border.hover} cursor-pointer transition-all`,
} as const;

export const button = {
  primary: `${bg.brand} ${bg.brandHover} ${bg.brandActive} ${text.inverse} px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md`,
  secondary: `${bg.surfaceSecondary} ${border.primary} ${text.primary} border px-4 py-2 rounded-lg ${bg.hover} hover:border-border-secondary transition-all duration-200 font-medium shadow-sm`,
  ghost: `${text.secondary} px-4 py-2 rounded-lg ${bg.hover} ${text.hover} transition-all duration-200 font-medium`,
  accent: `${bg.success} hover:bg-emerald-700 active:bg-emerald-800 ${text.inverse} px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md`,
  warning: `${bg.warning} hover:bg-amber-600 active:bg-amber-700 ${text.inverse} px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md`,
  danger: `${bg.error} hover:bg-red-700 active:bg-red-800 ${text.inverse} px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md`,
} as const;

export const input = {
  base: `${bg.surface} ${border.primary} ${text.primary} border rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:ring-opacity-50 focus:outline-none transition-all duration-200`,
  search: `${bg.surface} ${border.primary} ${text.primary} border rounded-lg pl-10 pr-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:ring-opacity-50 focus:outline-none transition-all duration-200`,
} as const;

// Status indicator utilities
export const status = {
  running: {
    dot: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  creating: {
    dot: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-400', 
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
  },
  stopped: {
    dot: 'bg-slate-400',
    text: 'text-slate-700 dark:text-slate-400',
    bg: 'bg-slate-50 dark:bg-slate-900/20', 
    border: 'border-slate-200 dark:border-slate-800',
  },
  error: {
    dot: 'bg-red-500',
    text: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
  },
} as const;

// Layout utilities
export const layout = {
  page: `min-h-screen ${bg.primary}`,
  container: 'max-w-7xl mx-auto px-4 sm:px-6',
  section: `${bg.secondary} ${border.primary} border-b`,
  header: `${bg.secondary} ${border.primary} border-b`,
} as const;

// Navigation utilities
export const nav = {
  item: `${text.secondary} ${text.hover} ${bg.hover} px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer`,
  itemActive: `${text.brand} bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg font-medium`,
  menu: `${bg.surface} ${border.primary} border rounded-lg shadow-lg`,
  menuItem: `${text.primary} ${bg.hover} px-4 py-2 transition-colors cursor-pointer first:rounded-t-lg last:rounded-b-lg`,
} as const;

// Workspace-specific utilities
export const workspace = {
  card: `card-interactive p-6 ${bg.workspace} shadow-sm hover:shadow-md`,
  header: `${bg.workspaceHeader} text-white shadow-lg`,
  sidebar: `${bg.secondary} ${border.primary} border-r`,
  mainContent: `${bg.primary} flex-1`,
  statusBar: `${bg.secondary} ${border.primary} border-t px-4 py-2`,
} as const;

// Utility classes that can be used with cn() for conditional styling
export const utilities = {
  focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
  disabled: 'opacity-50 cursor-not-allowed',
  loading: 'opacity-75 cursor-wait',
  interactive: 'cursor-pointer transition-all duration-200 hover:scale-[1.02]',
  shadow: 'shadow-sm hover:shadow-md transition-shadow duration-200',
} as const;
