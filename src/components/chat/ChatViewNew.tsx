import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { useAppStore } from '../../stores/appStore.js';
import MessageBubble from './MessageBubble.js';

export default function ChatView() {
  const { activeConversationId, conversations } = useAppStore();
  const [message, setMessage] = useState('');
  
  const activeConversation = conversations.find(conv => conv.id === activeConversationId);

  const handleSendMessage = () => {
    if (!message.trim() || !activeConversation) return;
    
    // TODO: Implement actual message sending
    console.log('Sending message:', message);
    setMessage('');
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!activeConversation) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <span className="text-3xl">💬</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Welcome to OpenCode
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Your intelligent coding companion is ready to help. Start a new conversation to begin chatting with your agentic AI assistant.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Ready to assist</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Chat Header */}
      <div className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                {activeConversation.title}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {activeConversation.messages.length} messages • Active now
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
              <span className="text-sm text-green-400 font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {activeConversation.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Start the conversation!</h3>
              <p className="text-gray-400 text-sm">Send a message to get started with your AI assistant.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {activeConversation.messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-700 bg-gray-800/50 backdrop-blur-xl p-6">
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                className="w-full px-4 py-3 pr-12 border border-gray-600 rounded-2xl bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none min-h-[60px] max-h-32"
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '60px',
                  maxHeight: '128px'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                }}
              />
              
              {/* Emoji and attachment buttons */}
              <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                <button
                  className="p-1.5 text-gray-400 hover:text-gray-300 transition-colors"
                  title="Add emoji"
                >
                  <Smile className="h-4 w-4" />
                </button>
                <button
                  className="p-1.5 text-gray-400 hover:text-gray-300 transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        
        {/* Quick actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <button className="text-xs text-gray-400 hover:text-gray-300 transition-colors">
              💻 Run Command
            </button>
            <button className="text-xs text-gray-400 hover:text-gray-300 transition-colors">
              📁 Browse Files
            </button>
            <button className="text-xs text-gray-400 hover:text-gray-300 transition-colors">
              🔧 Code Review
            </button>
          </div>
          <div className="text-xs text-gray-500">
            AI is typing...
          </div>
        </div>
      </div>
    </div>
  );
}
