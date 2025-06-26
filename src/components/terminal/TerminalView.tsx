import { useState, useRef, useEffect } from 'react';
import { Terminal, Copy, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

interface TerminalCommand {
  id: string;
  command: string;
  output: string;
  exitCode: number;
  timestamp: Date;
  duration?: number;
  expanded: boolean;
}

// Mock terminal commands that the AI might have run
const mockCommands: TerminalCommand[] = [
  {
    id: '1',
    command: 'npm install react-router-dom @types/react-router-dom',
    output: `npm WARN deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm WARN deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
npm WARN deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported

added 12 packages, and audited 294 packages in 3s

91 packages are looking for funding
  run \`npm fund\` for details

found 0 vulnerabilities`,
    exitCode: 0,
    timestamp: new Date('2025-06-26T09:15:00Z'),
    duration: 3200,
    expanded: false
  },
  {
    id: '2',
    command: 'git add src/components/layout/Header.tsx',
    output: '',
    exitCode: 0,
    timestamp: new Date('2025-06-26T09:18:00Z'),
    duration: 50,
    expanded: false
  },
  {
    id: '3',
    command: 'git commit -m "Add responsive header component with navigation"',
    output: `[main 7f8a9b2] Add responsive header component with navigation
 1 file changed, 87 insertions(+)
 create mode 100644 src/components/layout/Header.tsx`,
    exitCode: 0,
    timestamp: new Date('2025-06-26T09:18:30Z'),
    duration: 120,
    expanded: false
  },
  {
    id: '4',
    command: 'npm run build',
    output: `> opencode-frontend@0.1.0 build
> tsc && vite build

vite v4.4.5 building for production...
✓ 34 modules transformed.
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-d526a0c5.css    8.15 kB │ gzip:  2.31 kB
dist/assets/index-b12c3d4e.js   142.84 kB │ gzip: 45.12 kB
✓ built in 2.43s`,
    exitCode: 0,
    timestamp: new Date('2025-06-26T10:22:00Z'),
    duration: 2430,
    expanded: true
  },
  {
    id: '5',
    command: 'eslint src/ --fix',
    output: `src/components/chat/ChatView.tsx
  23:8  warning  'useState' is defined but never used  no-unused-vars

src/utils/mockData.ts
  45:15  error  Expected '===' and instead saw '=='  eqeqeq

✖ 2 problems (1 error, 1 warning)
  1 error and 0 warnings potentially fixable with the --fix flag.`,
    exitCode: 1,
    timestamp: new Date('2025-06-26T11:30:00Z'),
    duration: 890,
    expanded: true
  },
  {
    id: '6',
    command: 'git status',
    output: `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes to working directory)
        modified:   src/App.tsx
        modified:   src/components/layout/Sidebar.tsx
        modified:   src/stores/uiStore.ts

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        src/components/filesystem/
        src/components/terminal/

no changes added to commit (use "git add <file>..." or "git commit -a")`,
    exitCode: 0,
    timestamp: new Date('2025-06-26T12:00:00Z'),
    duration: 45,
    expanded: true
  }
];

const formatDuration = (ms: number) => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
};

interface CommandItemProps {
  command: TerminalCommand;
  onToggleExpand: (id: string) => void;
  onCopy: (text: string) => void;
}

function CommandItem({ command, onToggleExpand, onCopy }: CommandItemProps) {
  const hasOutput = command.output.trim().length > 0;
  const isError = command.exitCode !== 0;

  return (
    <div className="border border-gray-700 rounded-lg bg-gray-800/50 overflow-hidden">
      {/* Command header */}
      <div className="flex items-center gap-3 p-4 bg-gray-800 border-b border-gray-700">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
          isError ? 'bg-red-400' : 'bg-green-400'
        }`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <span>{formatTime(command.timestamp)}</span>
            {command.duration && (
              <>
                <span>•</span>
                <span>{formatDuration(command.duration)}</span>
              </>
            )}
            <span>•</span>
            <span className={isError ? 'text-red-400' : 'text-green-400'}>
              exit {command.exitCode}
            </span>
          </div>
          
          <div className="font-mono text-white bg-gray-900 px-3 py-2 rounded text-sm">
            $ {command.command}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onCopy(command.command)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Copy command"
          >
            <Copy className="h-4 w-4" />
          </button>
          
          {hasOutput && (
            <button
              onClick={() => onToggleExpand(command.id)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title={command.expanded ? "Collapse output" : "Expand output"}
            >
              {command.expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Command output */}
      {hasOutput && command.expanded && (
        <div className="p-4">
          <div className="bg-gray-900 border border-gray-600 rounded p-3">
            <pre className="text-sm text-gray-200 whitespace-pre-wrap font-mono overflow-x-auto">
              {command.output}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TerminalView() {
  const [commands, setCommands] = useState(mockCommands);
  const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [commands]);

  const handleToggleExpand = (id: string) => {
    setCommands(prev => prev.map(cmd => 
      cmd.id === id ? { ...cmd, expanded: !cmd.expanded } : cmd
    ));
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleClearHistory = () => {
    setCommands([]);
  };

  const filteredCommands = commands.filter(cmd => {
    if (filter === 'success') return cmd.exitCode === 0;
    if (filter === 'error') return cmd.exitCode !== 0;
    return true;
  });

  const errorCount = commands.filter(cmd => cmd.exitCode !== 0).length;
  const successCount = commands.filter(cmd => cmd.exitCode === 0).length;

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Clear History
          </button>
        </div>
        
        {/* Stats and filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>{commands.length} total commands</span>
            <span className="text-green-400">{successCount} successful</span>
            <span className="text-red-400">{errorCount} errors</span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('success')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'success' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Success
            </button>
            <button
              onClick={() => setFilter('error')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'error' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Errors
            </button>
          </div>
        </div>
      </div>

      {/* Commands list */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredCommands.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <Terminal className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No commands found</p>
            <p className="text-sm">
              {filter === 'all' 
                ? 'No commands have been executed yet'
                : `No ${filter === 'success' ? 'successful' : 'failed'} commands found`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCommands.map(command => (
              <CommandItem
                key={command.id}
                command={command}
                onToggleExpand={handleToggleExpand}
                onCopy={handleCopy}
              />
            ))}
            <div ref={terminalEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
