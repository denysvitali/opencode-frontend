import { Menu, Plus, Settings } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore.js';
import { useAppStore } from '../../stores/appStore.js';

export default function Header() {
  const { toggleSidebar } = useUIStore();
  const { connectionStatus, conversations, activeConversationId } = useAppStore();
  
  // Get active conversation directly from the store data
  const activeConversation = conversations.find(conv => conv.id === activeConversationId);

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTitle = () => {
    // Always show the conversation title if we have an active conversation
    // since all views (chat, files, git, terminal) are part of the same session
    if (activeConversation) {
      return activeConversation.title;
    }
    
    // Fallback to generic title if no conversation is active
    return 'OpenCode';
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo and title - now just showing conversation title */}
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-white">
              {getTitle()}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Connection status */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-700 rounded-full">
            <div className={`h-2.5 w-2.5 rounded-full ${getConnectionStatusColor()}`} />
            <span className="text-sm text-gray-300 capitalize font-medium">
              {connectionStatus}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              className="p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              aria-label="New conversation"
            >
              <Plus className="h-5 w-5" />
            </button>
            
            <button
              className="p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
