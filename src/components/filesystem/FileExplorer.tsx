import { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  File, 
  GitBranch, 
  FileX, 
  FilePlus, 
  FileText,
  Code,
  Image,
  Settings
} from 'lucide-react';
import FileContentViewer from './FileContentViewer.js';

// Mock filesystem data
interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  modified?: boolean;
  gitStatus?: 'added' | 'modified' | 'deleted' | 'untracked';
  children?: FileSystemItem[];
  size?: string;
  lastModified?: Date;
}

const mockFileSystem: FileSystemItem[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    path: '/src',
    children: [
      {
        id: '2',
        name: 'components',
        type: 'folder',
        path: '/src/components',
        children: [
          {
            id: '3',
            name: 'chat',
            type: 'folder',
            path: '/src/components/chat',
            children: [
              {
                id: '4',
                name: 'ChatView.tsx',
                type: 'file',
                path: '/src/components/chat/ChatView.tsx',
                gitStatus: 'modified',
                size: '3.2 KB',
                lastModified: new Date('2025-06-26T10:30:00Z')
              },
              {
                id: '5',
                name: 'MessageBubble.tsx',
                type: 'file',
                path: '/src/components/chat/MessageBubble.tsx',
                size: '1.8 KB',
                lastModified: new Date('2025-06-25T14:20:00Z')
              }
            ]
          },
          {
            id: '6',
            name: 'layout',
            type: 'folder',
            path: '/src/components/layout',
            children: [
              {
                id: '7',
                name: 'Layout.tsx',
                type: 'file',
                path: '/src/components/layout/Layout.tsx',
                size: '2.1 KB',
                lastModified: new Date('2025-06-24T09:15:00Z')
              },
              {
                id: '8',
                name: 'Sidebar.tsx',
                type: 'file',
                path: '/src/components/layout/Sidebar.tsx',
                gitStatus: 'modified',
                size: '4.5 KB',
                lastModified: new Date('2025-06-26T11:45:00Z')
              }
            ]
          },
          {
            id: '9',
            name: 'filesystem',
            type: 'folder',
            path: '/src/components/filesystem',
            children: [
              {
                id: '10',
                name: 'FileExplorer.tsx',
                type: 'file',
                path: '/src/components/filesystem/FileExplorer.tsx',
                gitStatus: 'added',
                size: '8.9 KB',
                lastModified: new Date('2025-06-26T12:00:00Z')
              }
            ]
          }
        ]
      },
      {
        id: '11',
        name: 'stores',
        type: 'folder',
        path: '/src/stores',
        children: [
          {
            id: '12',
            name: 'appStore.ts',
            type: 'file',
            path: '/src/stores/appStore.ts',
            size: '2.3 KB',
            lastModified: new Date('2025-06-25T16:30:00Z')
          },
          {
            id: '13',
            name: 'uiStore.ts',
            type: 'file',
            path: '/src/stores/uiStore.ts',
            gitStatus: 'modified',
            size: '1.2 KB',
            lastModified: new Date('2025-06-26T10:15:00Z')
          }
        ]
      },
      {
        id: '14',
        name: 'App.tsx',
        type: 'file',
        path: '/src/App.tsx',
        gitStatus: 'modified',
        size: '1.9 KB',
        lastModified: new Date('2025-06-26T11:30:00Z')
      }
    ]
  },
  {
    id: '15',
    name: 'package.json',
    type: 'file',
    path: '/package.json',
    size: '1.1 KB',
    lastModified: new Date('2025-06-24T08:00:00Z')
  },
  {
    id: '16',
    name: 'README.md',
    type: 'file',
    path: '/README.md',
    gitStatus: 'modified',
    size: '2.8 KB',
    lastModified: new Date('2025-06-26T09:45:00Z')
  }
];

const getFileIcon = (fileName: string, isFolder: boolean = false) => {
  if (isFolder) return null;
  
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'tsx':
    case 'ts':
    case 'js':
    case 'jsx':
      return <Code className="h-4 w-4 text-blue-400" />;
    case 'json':
      return <Settings className="h-4 w-4 text-yellow-400" />;
    case 'md':
      return <FileText className="h-4 w-4 text-green-400" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
      return <Image className="h-4 w-4 text-purple-400" />;
    default:
      return <File className="h-4 w-4 text-gray-400" />;
  }
};

const getGitStatusIcon = (status?: string) => {
  switch (status) {
    case 'added':
      return <FilePlus className="h-3 w-3 text-green-400" />;
    case 'modified':
      return <FileText className="h-3 w-3 text-yellow-400" />;
    case 'deleted':
      return <FileX className="h-3 w-3 text-red-400" />;
    default:
      return null;
  }
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

interface FileItemProps {
  item: FileSystemItem;
  depth: number;
  onSelect: (item: FileSystemItem) => void;
  onOpenFile: (item: FileSystemItem) => void;
  isSelected: boolean;
}

function FileItem({ item, depth, onSelect, onOpenFile, isSelected }: FileItemProps) {
  const [isExpanded, setIsExpanded] = useState(item.type === 'folder' && depth < 2);
  
  const handleClick = () => {
    if (item.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      // For files, open the content viewer
      onOpenFile(item);
    }
    onSelect(item);
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={`
          flex items-center gap-2 px-3 py-2 cursor-pointer rounded-lg transition-all duration-200 group
          ${isSelected 
            ? 'bg-blue-500/20 border border-blue-500/30' 
            : 'hover:bg-gray-700/50'
          }
        `}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        {/* Folder icon */}
        {item.type === 'folder' && (
          <>
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-blue-400 flex-shrink-0" />
            ) : (
              <Folder className="h-4 w-4 text-blue-400 flex-shrink-0" />
            )}
          </>
        )}
        
        {/* File icon */}
        {item.type === 'file' && getFileIcon(item.name)}
        
        {/* Name */}
        <span className={`text-sm truncate flex-1 ${
          item.gitStatus ? 'font-medium' : ''
        }`}>
          {item.name}
        </span>
        
        {/* Git status */}
        {item.gitStatus && (
          <div className="flex items-center gap-1">
            {getGitStatusIcon(item.gitStatus)}
          </div>
        )}
        
        {/* File size and time for files */}
        {item.type === 'file' && (
          <div className="flex items-center gap-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <span>{item.size}</span>
            <span>•</span>
            <span>{formatTimeAgo(item.lastModified!)}</span>
          </div>
        )}
      </div>
      
      {/* Children */}
      {item.type === 'folder' && isExpanded && item.children && (
        <div>
          {item.children.map(child => (
            <FileItem
              key={child.id}
              item={child}
              depth={depth + 1}
              onSelect={onSelect}
              onOpenFile={onOpenFile}
              isSelected={isSelected}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileExplorer() {
  const [selectedFile, setSelectedFile] = useState<FileSystemItem | null>(null);
  const [openedFile, setOpenedFile] = useState<FileSystemItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'modified' | 'added'>('all');

  const filteredFiles = (items: FileSystemItem[]): FileSystemItem[] => {
    return items.map(item => {
      if (item.type === 'folder' && item.children) {
        const filteredChildren = filteredFiles(item.children);
        if (filter === 'all' || filteredChildren.length > 0) {
          return { ...item, children: filteredChildren };
        }
        return null;
      } else if (item.type === 'file') {
        if (filter === 'all' || item.gitStatus === filter) {
          return item;
        }
        return null;
      }
      return item;
    }).filter(Boolean) as FileSystemItem[];
  };

  const displayedFiles = filteredFiles(mockFileSystem);

  const handleOpenFile = (file: FileSystemItem) => {
    if (file.type === 'file') {
      setOpenedFile(file);
    }
  };

  const handleCloseFileViewer = () => {
    setOpenedFile(null);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        {/* Filter buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Files
          </button>
          <button
            onClick={() => setFilter('modified')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              filter === 'modified' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <GitBranch className="h-4 w-4" />
            Modified
          </button>
          <button
            onClick={() => setFilter('added')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              filter === 'added' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <FilePlus className="h-4 w-4" />
            Added
          </button>
        </div>
      </div>

      {/* File tree */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          {displayedFiles.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <Folder className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No files found with current filter</p>
            </div>
          ) : (
            displayedFiles.map(item => (
              <FileItem
                key={item.id}
                item={item}
                depth={0}
                onSelect={setSelectedFile}
                onOpenFile={handleOpenFile}
                isSelected={selectedFile?.id === item.id}
              />
            ))
          )}
        </div>
      </div>

      {/* File details panel */}
      {selectedFile && (
        <div className="border-t border-gray-700 p-4 bg-gray-800">
          <h3 className="font-semibold text-white mb-2">{selectedFile.name}</h3>
          <div className="space-y-1 text-sm text-gray-400">
            <div>Path: {selectedFile.path}</div>
            {selectedFile.size && <div>Size: {selectedFile.size}</div>}
            {selectedFile.lastModified && (
              <div>Modified: {formatTimeAgo(selectedFile.lastModified)}</div>
            )}
            {selectedFile.gitStatus && (
              <div className="flex items-center gap-2">
                Git Status: 
                <span className={`font-medium ${
                  selectedFile.gitStatus === 'added' ? 'text-green-400' :
                  selectedFile.gitStatus === 'modified' ? 'text-yellow-400' :
                  selectedFile.gitStatus === 'deleted' ? 'text-red-400' :
                  'text-gray-400'
                }`}>
                  {selectedFile.gitStatus}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* File content viewer modal */}
      {openedFile && (
        <FileContentViewer
          filePath={openedFile.path}
          fileName={openedFile.name}
          onClose={handleCloseFileViewer}
        />
      )}
    </div>
  );
}
