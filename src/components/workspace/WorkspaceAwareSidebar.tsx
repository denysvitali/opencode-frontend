import { useState } from 'react';
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Clock, 
  MoreHorizontal, 
  Filter,
  Activity,
  Users,
  Zap,
  CheckCircle,
  Pause,
  Circle,
  Star,
  Pin
} from 'lucide-react';

// TODO: Replace with real session data from API
const mockSessionsByWorkspace = {
  'ws-1': [
  {
    id: 'sess-1',
    name: 'Implement Stripe payment integration',
    status: 'active' as const,
    messageCount: 23,
    lastMessage: 'Great! The payment integration is working. Let me run the tests...',
    lastActivity: new Date('2024-01-20T14:30:00'),
    isPinned: true,
    hasUnread: false
  },
  {
    id: 'sess-2',
    name: 'Debug user authentication',
    status: 'completed' as const,
    messageCount: 15,
    lastMessage: 'Perfect! The JWT token validation is now working correctly.',
    lastActivity: new Date('2024-01-19T16:45:00'),
    isPinned: false,
    hasUnread: false
  },
  {
    id: 'sess-3',
    name: 'Add Elasticsearch search',
    status: 'paused' as const,
    messageCount: 31,
    lastMessage: 'I need to check the Elasticsearch configuration...',
    lastActivity: new Date('2024-01-18T17:30:00'),
    isPinned: false,
    hasUnread: true
  },
  {
    id: 'sess-4',
    name: 'Database performance optimization',
    status: 'completed' as const,
    messageCount: 8,
    lastMessage: 'Database performance is now 3x faster with the new indexes.',
    lastActivity: new Date('2024-01-17T15:20:00'),
    isPinned: false,
    hasUnread: false
  },
  {
    id: 'sess-5',
    name: 'Implement real-time notifications',
    status: 'active' as const,
    messageCount: 12,
    lastMessage: 'Working on WebSocket implementation for notifications...',
    lastActivity: new Date('2024-01-16T11:30:00'),
    isPinned: false,
    hasUnread: true
  }],
  'ws-2': [
    {
      id: 'sess-6',
      name: 'Set up authentication API',
      status: 'active' as const,
      messageCount: 18,
      lastMessage: 'Working on JWT token implementation and user registration endpoints...',
      lastActivity: new Date('2024-01-20T13:15:00'),
      isPinned: true,
      hasUnread: false
    },
    {
      id: 'sess-7',
      name: 'Database schema design',
      status: 'completed' as const,
      messageCount: 25,
      lastMessage: 'Database schema is complete with proper relationships and indexes.',
      lastActivity: new Date('2024-01-19T14:30:00'),
      isPinned: false,
      hasUnread: false
    },
    {
      id: 'sess-8',
      name: 'API rate limiting',
      status: 'paused' as const,
      messageCount: 9,
      lastMessage: 'Need to implement Redis for rate limiting middleware...',
      lastActivity: new Date('2024-01-18T10:45:00'),
      isPinned: false,
      hasUnread: true
    }
  ],
  'ws-3': [
    {
      id: 'sess-9',
      name: 'Spark job configuration',
      status: 'paused' as const,
      messageCount: 12,
      lastMessage: 'Configuring Spark cluster for data processing pipeline...',
      lastActivity: new Date('2024-01-15T16:20:00'),
      isPinned: false,
      hasUnread: false
    },
    {
      id: 'sess-10',
      name: 'ETL pipeline optimization',
      status: 'completed' as const,
      messageCount: 33,
      lastMessage: 'Pipeline now processes 10x more data with optimized transformations.',
      lastActivity: new Date('2024-01-12T11:30:00'),
      isPinned: false,
      hasUnread: false
    }
  ]
};

interface WorkspaceAwareSidebarProps {
  workspaceId: string;
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void;
}

export default function WorkspaceAwareSidebar({ 
  workspaceId,
  activeSessionId, 
  onSelectSession, 
  onCreateSession 
}: WorkspaceAwareSidebarProps) {
  
  const mockSessions = mockSessionsByWorkspace[workspaceId as keyof typeof mockSessionsByWorkspace] || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'paused'>('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Circle className="h-2 w-2 fill-green-400 text-green-400" />;
      case 'completed': return <CheckCircle className="h-2 w-2 fill-blue-400 text-blue-400" />;
      case 'paused': return <Pause className="h-2 w-2 fill-yellow-400 text-yellow-400" />;
      default: return <Circle className="h-2 w-2 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'border-l-green-400';
      case 'completed': return 'border-l-blue-400';
      case 'paused': return 'border-l-yellow-400';
      default: return 'border-l-gray-400';
    }
  };

  const filteredSessions = mockSessions.filter(session => {
    const matchesSearch = session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || session.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const pinnedSessions = filteredSessions.filter(s => s.isPinned);
  const unpinnedSessions = filteredSessions.filter(s => !s.isPinned);

  return (
    <div className="w-80 h-full bg-gray-900/50 backdrop-blur-xl border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Chat Sessions</h2>
          <button
            onClick={onCreateSession}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-lg"
            title="New Chat Session"
          >
            <Plus className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-1">
          {[
            { key: 'all', label: 'All', count: mockSessions.length },
            { key: 'active', label: 'Active', count: mockSessions.filter(s => s.status === 'active').length },
            { key: 'completed', label: 'Done', count: mockSessions.filter(s => s.status === 'completed').length },
            { key: 'paused', label: 'Paused', count: mockSessions.filter(s => s.status === 'paused').length }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setFilterStatus(filter.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                filterStatus === filter.key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {filter.label} {filter.count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                  filterStatus === filter.key ? 'bg-white/20' : 'bg-white/10'
                }`}>
                  {filter.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {/* Pinned Sessions */}
        {pinnedSessions.length > 0 && (
          <div className="p-4 pb-2">
            <div className="flex items-center gap-2 mb-3">
              <Pin className="h-3 w-3 text-yellow-400" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Pinned</span>
            </div>
            <div className="space-y-2">
              {pinnedSessions.map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  isActive={activeSessionId === session.id}
                  onClick={() => onSelectSession(session.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regular Sessions */}
        <div className="p-4 pt-2">
          {pinnedSessions.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="h-3 w-3 text-gray-400" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Recent</span>
            </div>
          )}
          <div className="space-y-2">
            {unpinnedSessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                isActive={activeSessionId === session.id}
                onClick={() => onSelectSession(session.id)}
              />
            ))}
          </div>
        </div>

        {filteredSessions.length === 0 && (
          <div className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {searchQuery ? 'No sessions match your search' : 'No sessions found'}
            </p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              <span>{mockSessions.filter(s => s.status === 'active').length} active</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{mockSessions.reduce((acc, s) => acc + s.messageCount, 0)} messages</span>
            </div>
          </div>
          <button className="p-1 rounded hover:bg-white/10 transition-colors">
            <MoreHorizontal className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface SessionCardProps {
  session: any;
  isActive: boolean;
  onClick: () => void;
}

function SessionCard({ session, isActive, onClick }: SessionCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Circle className="h-2 w-2 fill-green-400 text-green-400 animate-pulse" />;
      case 'completed': return <CheckCircle className="h-2 w-2 fill-blue-400 text-blue-400" />;
      case 'paused': return <Pause className="h-2 w-2 fill-yellow-400 text-yellow-400" />;
      default: return <Circle className="h-2 w-2 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'border-l-green-400';
      case 'completed': return 'border-l-blue-400';
      case 'paused': return 'border-l-yellow-400';
      default: return 'border-l-gray-400';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border-l-2 transition-all duration-200 group ${
        isActive
          ? 'bg-blue-600/20 border-l-blue-400 ring-1 ring-blue-500/30'
          : `bg-white/5 hover:bg-white/10 ${getStatusColor(session.status)}`
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {session.isPinned && <Pin className="h-3 w-3 text-yellow-400 flex-shrink-0" />}
          <h3 className={`font-medium text-sm truncate ${
            isActive ? 'text-white' : 'text-gray-200 group-hover:text-white'
          }`}>
            {session.name}
          </h3>
          {session.hasUnread && (
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {getStatusIcon(session.status)}
        </div>
      </div>

      <p className={`text-xs mb-2 line-clamp-2 ${
        isActive ? 'text-gray-300' : 'text-gray-400'
      }`}>
        {session.lastMessage}
      </p>

      <div className="flex items-center justify-end">
        <div className={`flex items-center gap-1 text-xs ${
          isActive ? 'text-gray-300' : 'text-gray-500'
        }`}>
          <Clock className="h-3 w-3" />
          <span>{session.lastActivity.toLocaleDateString()}</span>
        </div>
      </div>
    </button>
  );
}