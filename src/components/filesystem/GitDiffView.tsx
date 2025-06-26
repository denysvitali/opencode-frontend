import { useState } from 'react';
import { GitBranch, FileText, FilePlus, FileX, Eye, EyeOff } from 'lucide-react';
import FileContentViewer from './FileContentViewer.js';

interface GitDiffFile {
  id: string;
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
  diff: string;
}

// Mock git diff data
const mockGitDiff: GitDiffFile[] = [
  {
    id: '1',
    path: 'src/App.tsx',
    status: 'modified',
    additions: 8,
    deletions: 3,
    diff: `@@ -1,7 +1,7 @@
 import { useEffect } from 'react';
-import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
+import { BrowserRouter as Router } from 'react-router-dom';
 import { useUIStore } from './stores/uiStore.js';
 import { useAppStore } from './stores/appStore.js';
 import Layout from './components/layout/Layout.js';
-import ChatView from './components/chat/ChatView.js';
+import MainView from './components/layout/MainView.js';
 import { createMockData } from './utils/mockData.js';

@@ -42,11 +42,7 @@ function App() {
   return (
     <Router basename={import.meta.env.BASE_URL}>
       <div className="min-h-screen bg-gray-900 text-white">
         <Layout>
-          <Routes>
-            <Route path="/" element={<ChatView />} />
-            <Route path="/conversation/:id" element={<ChatView />} />
-          </Routes>
+          <MainView />
         </Layout>
       </div>
     </Router>`
  },
  {
    id: '2',
    path: 'src/components/filesystem/FileExplorer.tsx',
    status: 'added',
    additions: 287,
    deletions: 0,
    diff: `@@ -0,0 +1,287 @@
+import { useState } from 'react';
+import { 
+  Folder, 
+  FolderOpen, 
+  File, 
+  GitBranch, 
+  FileX, 
+  FilePlus, 
+  FileText,
+  Code,
+  Image,
+  Settings
+} from 'lucide-react';
+
+// Mock filesystem data
+interface FileSystemItem {
+  id: string;
+  name: string;
+  type: 'file' | 'folder';
+  path: string;
+  modified?: boolean;
+  gitStatus?: 'added' | 'modified' | 'deleted' | 'untracked';
+  children?: FileSystemItem[];
+  size?: string;
+  lastModified?: Date;
+}
+
+const mockFileSystem: FileSystemItem[] = [
+  // ... rest of the file content`
  },
  {
    id: '3',
    path: 'src/components/terminal/TerminalView.tsx',
    status: 'added',
    additions: 245,
    deletions: 0,
    diff: `@@ -0,0 +1,245 @@
+import { useState, useRef, useEffect } from 'react';
+import { Terminal, Copy, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
+
+interface TerminalCommand {
+  id: string;
+  command: string;
+  output: string;
+  exitCode: number;
+  timestamp: Date;
+  duration?: number;
+  expanded: boolean;
+}
+
+// Mock terminal commands that the AI might have run
+const mockCommands: TerminalCommand[] = [
+  // ... rest of the file content`
  },
  {
    id: '4',
    path: 'src/stores/uiStore.ts',
    status: 'modified',
    additions: 5,
    deletions: 1,
    diff: `@@ -1,6 +1,6 @@
 import { create } from 'zustand';
 import { devtools } from 'zustand/middleware';
-import type { UIState } from '../types/index.js';
+import type { UIState, ViewType } from '../types/index.js';

 interface UIStore extends UIState {
   // Actions
@@ -8,6 +8,7 @@ interface UIStore extends UIState {
   setSidebarOpen: (open: boolean) => void;
   setIsMobile: (isMobile: boolean) => void;
   setTheme: (theme: 'light' | 'dark' | 'system') => void;
+  setActiveView: (view: ViewType) => void;
 }

@@ -17,6 +18,7 @@ export const useUIStore = create<UIStore>()(
       isSidebarOpen: false,
       isMobile: false,
       theme: 'system',
+      activeView: 'chat',

       // Actions
       toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
@@ -29,6 +31,8 @@ export const useUIStore = create<UIStore>()(
       }),

       setTheme: (theme) => set({ theme }),
+      
+      setActiveView: (view) => set({ activeView: view }),
     }),
     { name: 'OpenCode UI Store' }
   )`
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'added':
      return 'text-green-400';
    case 'modified':
      return 'text-yellow-400';
    case 'deleted':
      return 'text-red-400';
    case 'renamed':
      return 'text-blue-400';
    default:
      return 'text-gray-400';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'added':
      return <FilePlus className="h-4 w-4" />;
    case 'modified':
      return <FileText className="h-4 w-4" />;
    case 'deleted':
      return <FileX className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

interface GitDiffItemProps {
  file: GitDiffFile;
  isExpanded: boolean;
  onToggle: () => void;
  onOpenFile: (file: GitDiffFile) => void;
}

function GitDiffItem({ file, isExpanded, onToggle, onOpenFile }: GitDiffItemProps) {
  return (
    <div className="border border-gray-700 rounded-lg bg-gray-800/50 overflow-hidden">
      {/* File header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-700/50 transition-colors"
        onClick={onToggle}
        onDoubleClick={() => onOpenFile(file)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`${getStatusColor(file.status)}`}>
            {getStatusIcon(file.status)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="font-mono text-sm text-white truncate">
              {file.path}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className={`font-medium capitalize ${getStatusColor(file.status)}`}>
                {file.status}
              </span>
              {file.additions > 0 && (
                <span className="text-green-400">+{file.additions}</span>
              )}
              {file.deletions > 0 && (
                <span className="text-red-400">-{file.deletions}</span>
              )}
            </div>
          </div>
        </div>

        <button className="p-1 text-gray-400 hover:text-white">
          {isExpanded ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Diff content */}
      {isExpanded && (
        <div className="border-t border-gray-700">
          <div className="p-4 bg-gray-900">
            <pre className="text-sm font-mono overflow-x-auto">
              {file.diff.split('\n').map((line, index) => {
                let lineClass = 'text-gray-300';
                if (line.startsWith('+')) {
                  lineClass = 'text-green-400 bg-green-900/20';
                } else if (line.startsWith('-')) {
                  lineClass = 'text-red-400 bg-red-900/20';
                } else if (line.startsWith('@@')) {
                  lineClass = 'text-blue-400 bg-blue-900/20';
                }
                
                return (
                  <div key={index} className={`${lineClass} px-2 py-0.5`}>
                    {line}
                  </div>
                );
              })}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GitDiffView() {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [openedFile, setOpenedFile] = useState<GitDiffFile | null>(null);
  const [filter, setFilter] = useState<'all' | 'added' | 'modified' | 'deleted'>('all');

  const toggleExpanded = (fileId: string) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const filteredFiles = mockGitDiff.filter(file => 
    filter === 'all' || file.status === filter
  );

  const totalAdditions = mockGitDiff.reduce((sum, file) => sum + file.additions, 0);
  const totalDeletions = mockGitDiff.reduce((sum, file) => sum + file.deletions, 0);

  const handleOpenFile = (file: GitDiffFile) => {
    setOpenedFile(file);
  };

  const handleCloseFileViewer = () => {
    setOpenedFile(null);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        {/* Stats */}
        <div className="flex items-center gap-6 mb-4 text-sm">
          <span className="text-gray-400">
            {mockGitDiff.length} files changed
          </span>
          <span className="text-green-400">
            +{totalAdditions} additions
          </span>
          <span className="text-red-400">
            -{totalDeletions} deletions
          </span>
        </div>
        
        {/* Filter buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Changes
          </button>
          <button
            onClick={() => setFilter('added')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'added' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Added
          </button>
          <button
            onClick={() => setFilter('modified')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'modified' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Modified
          </button>
          <button
            onClick={() => setFilter('deleted')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'deleted' 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Deleted
          </button>
        </div>
      </div>

      {/* Files list */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredFiles.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <GitBranch className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No changes found</p>
            <p className="text-sm">
              {filter === 'all' 
                ? 'No files have been modified'
                : `No ${filter} files found`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFiles.map(file => (
              <GitDiffItem
                key={file.id}
                file={file}
                isExpanded={expandedFiles.has(file.id)}
                onToggle={() => toggleExpanded(file.id)}
                onOpenFile={handleOpenFile}
              />
            ))}
          </div>
        )}
      </div>

      {/* File content viewer modal */}
      {openedFile && (
        <FileContentViewer
          filePath={openedFile.path}
          fileName={openedFile.path.split('/').pop() || openedFile.path}
          onClose={handleCloseFileViewer}
        />
      )}
    </div>
  );
}
