import { Search, Plus, MoreHorizontal } from 'lucide-react';
import { useAppStore } from '../../stores/appStore.js';
import type { Conversation } from '../../types/index.js';
import { useState } from 'react';

export default function Sidebar() {
  const { conversations, activeConversationId, setActiveConversation } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewConversation = () => {
    // TODO: Implement new conversation logic
    console.log('New conversation clicked');
  };

  return (
    <div className="h-full bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-10 w-10 bg-black rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-xl">⌬</span>
          </div>
          <h2 className="text-xl font-bold text-white">OpenCode</h2>
        </div>
        
        <button
          onClick={handleNewConversation}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          <span className="font-semibold">New Chat</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-6 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto px-3">
        <div className="space-y-2">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === activeConversationId}
                onClick={() => setActiveConversation(conversation.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const timeAgo = formatTimeAgo(conversation.updatedAt);

  const getSandboxStatusColor = (status?: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'disconnected':
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        group flex flex-col p-4 rounded-xl cursor-pointer transition-all duration-200 relative
        ${isActive 
          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-lg' 
          : 'hover:bg-gray-700/50 border border-transparent'
        }
      `}
    >
      {/* Main content */}
      <div className="flex items-start justify-between mb-1">
        <h3 className={`text-sm font-semibold truncate pr-2 ${
          isActive ? 'text-blue-300' : 'text-white'
        }`}>
          {conversation.title}
        </h3>
        <div className="relative flex items-center justify-end w-8">
          {/* Time indicator - fades out on hover */}
          <span className="absolute text-xs text-gray-400 font-medium whitespace-nowrap opacity-100 group-hover:opacity-0 transition-opacity duration-200">
            {timeAgo}
          </span>
          {/* Three dots menu - fades in on hover */}
          <button
            className="absolute opacity-0 group-hover:opacity-100 p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-600 transition-opacity duration-200"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Show conversation options menu
            }}
          >
            <MoreHorizontal className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Message preview and sandbox status */}
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {lastMessage ? (
            <p className="text-xs text-gray-400 truncate">
              {lastMessage.type === 'user' ? '🙋 You: ' : '🤖 AI: '}
              {lastMessage.content}
            </p>
          ) : (
            <p className="text-xs text-gray-400 italic">No messages yet</p>
          )}
        </div>
        
        {/* Sandbox status indicator */}
        {conversation.sandboxStatus && (
          <div className="flex items-center ml-2">
            <div className={`w-2 h-2 rounded-full ${getSandboxStatusColor(conversation.sandboxStatus)}`} />
          </div>
        )}
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const dateObj = date instanceof Date ? date : new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
  return `${Math.floor(diffInMinutes / 1440)}d`;
}
