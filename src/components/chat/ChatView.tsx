import { useAppStore } from '../../stores/appStore.js';

export default function ChatView() {
  const { activeConversationId, conversations } = useAppStore();
  
  const activeConversation = conversations.find(conv => conv.id === activeConversationId);

  if (!activeConversation) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="h-16 w-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-primary-600 dark:text-primary-400">💬</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Welcome to OpenCode
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            Start a new conversation to begin chatting with your agentic AI assistant.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Chat header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {activeConversation.title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {activeConversation.messages.length} messages
        </p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeConversation.messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {activeConversation.messages.map((message) => (
              <div key={message.id} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-500 text-white'
                }`}>
                  {message.type === 'user' ? 'U' : 'AI'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                      : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                  }`}>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                      {message.content}
                    </p>
                    {message.status === 'sending' && (
                      <div className="mt-2 flex items-center space-x-1 text-xs text-gray-500">
                        <div className="animate-spin h-3 w-3 border border-gray-300 border-t-transparent rounded-full"></div>
                        <span>Sending...</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex space-x-3">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
