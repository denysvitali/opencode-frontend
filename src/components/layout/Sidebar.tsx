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
    <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={handleNewConversation}
          className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
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

  return (
    <div
      onClick={onClick}
      className={`
        group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors
        ${isActive 
          ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }
      `}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-medium truncate ${
            isActive ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'
          }`}>
            {conversation.title}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            {timeAgo}
          </span>
        </div>
        {lastMessage && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
            {lastMessage.type === 'user' ? 'You: ' : ''}
            {lastMessage.content}
          </p>
        )}
      </div>
      
      <button
        className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          // TODO: Show conversation options menu
        }}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
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
