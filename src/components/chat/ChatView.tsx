import { useAppStore } from '../../stores/appStore.js';
import type { Message } from '../../types/index.js';

export default function ChatView() {
  const { activeConversationId, conversations } = useAppStore();
  
  const activeConversation = conversations.find(conv => conv.id === activeConversationId);

  if (!activeConversation) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md">
          <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <span className="text-3xl">💬</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Welcome to OpenCode
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Start a new conversation to begin chatting with your agentic AI assistant.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Chat header */}
      <div className="border-b border-gray-700 p-6 bg-gray-800">
        <h2 className="text-xl font-bold text-white mb-1">
          {activeConversation.title}
        </h2>
        <p className="text-sm text-gray-400">
          {activeConversation.messages.length} messages • Active conversation
        </p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeConversation.messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-12">
            <div className="h-16 w-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <p className="text-lg">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          activeConversation.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
      </div>

      {/* Message input */}
      <div className="border-t border-gray-700 p-6 bg-gray-800">
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 px-4 py-4 border border-gray-600 rounded-2xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <button
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.type === 'user';
  const timestamp = message.timestamp instanceof Date 
    ? message.timestamp 
    : new Date(message.timestamp);

  const getBubbleStyles = () => {
    if (isUser) {
      return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-12';
    }
    
    switch (message.type) {
      case 'command':
        return 'bg-gradient-to-br from-green-600 to-green-700 text-white mr-12';
      case 'code':
        return 'bg-gradient-to-br from-purple-600 to-purple-700 text-white mr-12';
      case 'system':
        return 'bg-gradient-to-br from-yellow-600 to-yellow-700 text-white mr-12';
      default:
        return 'bg-gradient-to-br from-gray-600 to-gray-700 text-white mr-12';
    }
  };

  const getAvatar = () => {
    if (isUser) {
      return '🙋';
    }
    
    switch (message.type) {
      case 'command':
        return '⚡';
      case 'code':
        return '💻';
      case 'system':
        return '⚙️';
      default:
        return '🤖';
    }
  };

  const getTypeLabel = () => {
    switch (message.type) {
      case 'command':
        return 'Command';
      case 'code':
        return 'Code';
      case 'system':
        return 'System';
      default:
        return 'AI';
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar and type */}
        <div className={`flex items-center mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <div className={`flex items-center space-x-2 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-lg">
              {getAvatar()}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-300">
                {isUser ? 'You' : getTypeLabel()}
              </span>
              <span className="text-xs text-gray-400">
                {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Message bubble */}
        <div className={`relative p-4 rounded-2xl shadow-lg ${getBubbleStyles()}`}>
          {/* Speech bubble tail */}
          <div className={`absolute top-4 w-0 h-0 ${
            isUser 
              ? 'right-[-8px] border-l-[16px] border-l-blue-500 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent'
              : 'left-[-8px] border-r-[16px] border-r-gray-600 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent'
          }`} />
          
          {/* Message content */}
          <div className="relative z-10">
            <p className="whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
            
            {/* Special content for different message types */}
            {message.metadata?.command && (
              <div className="mt-3 p-3 bg-black/20 rounded-lg border border-white/10">
                <div className="text-xs font-mono text-gray-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold">Command:</span>
                    <span>{message.metadata.command.name} {message.metadata.command.args?.join(' ')}</span>
                  </div>
                  {message.metadata.command.exitCode !== undefined && (
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">Exit Code:</span>
                      <span className={message.metadata.command.exitCode === 0 ? 'text-green-300' : 'text-red-300'}>
                        {message.metadata.command.exitCode}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {message.metadata?.code && (
              <div className="mt-3 p-3 bg-black/20 rounded-lg border border-white/10">
                <div className="text-xs text-gray-200">
                  <span className="font-semibold">Language:</span> {message.metadata.code.language}
                  {message.metadata.code.filename && (
                    <>
                      <br />
                      <span className="font-semibold">File:</span> {message.metadata.code.filename}
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* Sending status */}
            {message.status === 'sending' && (
              <div className="mt-3 flex items-center space-x-2 text-xs">
                <div className="animate-spin h-3 w-3 border border-white/30 border-t-white rounded-full"></div>
                <span className="text-white/70">Sending...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
