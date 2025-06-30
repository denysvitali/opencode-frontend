import { ArrowLeft, Cpu, MemoryStick, Settings, MoreHorizontal, MessageCircle } from 'lucide-react';

// TODO: Replace with real workspace data from API
const mockWorkspaces = {
  'ws-1': {
    id: 'ws-1',
    name: 'E-commerce Platform',
    status: 'running' as const,
    repository: {
      url: 'https://github.com/company/ecommerce-platform',
      ref: 'main',
      lastCommit: '3f2a1b5'
    },
    resources: {
      cpu: { current: 45, limit: 100, unit: '%' },
      memory: { current: 2.8, limit: 4, unit: 'GB' },
      storage: { current: 12.4, limit: 20, unit: 'GB' }
    },
    activeSessions: 3,
    uptime: '2h 34m'
  },
  'ws-2': {
    id: 'ws-2',
    name: 'Mobile App Backend',
    status: 'creating' as const,
    repository: {
      url: 'https://github.com/company/mobile-backend',
      ref: 'develop',
      lastCommit: '8c9d2e1'
    },
    resources: {
      cpu: { current: 23, limit: 100, unit: '%' },
      memory: { current: 1.2, limit: 2, unit: 'GB' },
      storage: { current: 5.8, limit: 10, unit: 'GB' }
    },
    activeSessions: 1,
    uptime: '45m'
  },
  'ws-3': {
    id: 'ws-3',
    name: 'Data Pipeline',
    status: 'stopped' as const,
    repository: null,
    resources: {
      cpu: { current: 0, limit: 100, unit: '%' },
      memory: { current: 0, limit: 8, unit: 'GB' },
      storage: { current: 28.5, limit: 50, unit: 'GB' }
    },
    activeSessions: 0,
    uptime: 'Offline'
  }
};

const mockSessionsByWorkspace = {
  'ws-1': {
    id: 'sess-1',
    name: 'Implement Stripe payment integration',
    status: 'active' as const,
    messageCount: 23,
    duration: '1h 12m'
  },
  'ws-2': {
    id: 'sess-5',
    name: 'Setup JWT authentication',
    status: 'active' as const,
    messageCount: 12,
    duration: '45m'
  },
  'ws-3': {
    id: 'sess-7',
    name: 'Configure Apache Spark cluster',
    status: 'paused' as const,
    messageCount: 18,
    duration: '2h 15m'
  }
};

interface WorkspaceAwareHeaderProps {
  workspaceId: string;
  onBackToWorkspaces: () => void;
  onBackToSessions: () => void;
  onOpenWorkspaceSettings: () => void;
}

export default function WorkspaceAwareHeader({ 
  workspaceId,
  onBackToSessions, 
  onOpenWorkspaceSettings 
}: WorkspaceAwareHeaderProps) {
  
  const mockWorkspace = mockWorkspaces[workspaceId as keyof typeof mockWorkspaces] || mockWorkspaces['ws-1'];
  const mockSession = mockSessionsByWorkspace[workspaceId as keyof typeof mockSessionsByWorkspace] || mockSessionsByWorkspace['ws-1'];

  const getResourceColor = (usage: number) => {
    if (usage < 50) return 'text-green-400';
    if (usage < 80) return 'text-yellow-400';
    return 'text-red-400';
  };


  const cpuUsage = mockWorkspace.resources.cpu.current;
  const memUsage = (mockWorkspace.resources.memory.current / mockWorkspace.resources.memory.limit) * 100;

  return (
    <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 relative z-50">
      <div className="px-6 py-4">
        {/* Main Header Row */}
        <div className="flex items-center justify-between">
          {/* Left: Navigation & Session Info */}
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToSessions}
              className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 group"
              title="Back to Sessions"
            >
              <ArrowLeft className="h-4 w-4 text-gray-400 group-hover:text-white" />
            </button>

            {/* Current Session Info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-blue-400" />
              </div>
              
              <div>
                <h1 className="text-lg font-semibold text-white">{mockSession.name}</h1>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{mockSession.messageCount} messages</span>
                  <span>•</span>
                  <span>{mockSession.duration}</span>
                  <span>•</span>
                  <span className="text-blue-400">{mockWorkspace.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Session Info & Controls */}
          <div className="flex items-center gap-4">
            {/* Current Session */}
            <div className="text-right">
              <div className="text-sm font-medium text-white">{mockSession.name}</div>
              <div className="text-xs text-gray-400">{mockSession.messageCount} messages • {mockSession.duration}</div>
            </div>

            {/* Resource Indicators */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5">
                <Cpu className="h-3 w-3 text-blue-400" />
                <span className={`text-xs font-medium ${getResourceColor(cpuUsage)}`}>
                  {cpuUsage}%
                </span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5">
                <MemoryStick className="h-3 w-3 text-purple-400" />
                <span className={`text-xs font-medium ${getResourceColor(memUsage)}`}>
                  {Math.round(memUsage)}%
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenWorkspaceSettings}
                className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                title="Workspace Settings"
              >
                <Settings className="h-4 w-4 text-gray-400" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200">
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}