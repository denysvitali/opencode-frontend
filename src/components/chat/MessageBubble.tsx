import type { Message } from '../../types/index.js';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.type === 'user';
  const timestamp = message.timestamp instanceof Date 
    ? message.timestamp 
    : new Date(message.timestamp);

  const getBubbleStyles = () => {
    switch (message.type) {
      case 'user':
        return {
          container: 'flex-row-reverse',
          bubble: 'bg-blue-600 text-white relative shadow-lg',
          arrow: 'absolute right-0 top-4 transform translate-x-2 w-0 h-0 border-l-8 border-l-blue-600 border-t-8 border-t-transparent border-b-8 border-b-transparent',
          avatar: 'bg-blue-600 text-white font-bold shadow-md',
          avatarText: 'You'
        };
      case 'assistant':
        return {
          container: 'flex-row',
          bubble: 'bg-gray-700 text-white relative shadow-lg',
          arrow: 'absolute left-0 top-4 transform -translate-x-2 w-0 h-0 border-r-8 border-r-gray-700 border-t-8 border-t-transparent border-b-8 border-b-transparent',
          avatar: 'bg-emerald-600 text-white font-bold shadow-md',
          avatarText: 'AI'
        };
      case 'system':
        return {
          container: 'flex-row',
          bubble: 'bg-amber-600 text-white relative shadow-lg',
          arrow: 'absolute left-0 top-4 transform -translate-x-2 w-0 h-0 border-r-8 border-r-amber-600 border-t-8 border-t-transparent border-b-8 border-b-transparent',
          avatar: 'bg-amber-600 text-white font-bold shadow-md',
          avatarText: 'SYS'
        };
      case 'command':
        return {
          container: 'flex-row',
          bubble: 'bg-emerald-700 text-white relative font-mono shadow-lg',
          arrow: 'absolute left-0 top-4 transform -translate-x-2 w-0 h-0 border-r-8 border-r-emerald-700 border-t-8 border-t-transparent border-b-8 border-b-transparent',
          avatar: 'bg-emerald-700 text-white font-bold shadow-md',
          avatarText: 'CMD'
        };
      case 'code':
        return {
          container: 'flex-row',
          bubble: 'bg-gray-900 text-green-400 relative font-mono border border-green-500/30 shadow-lg',
          arrow: 'absolute left-0 top-4 transform -translate-x-2 w-0 h-0 border-r-8 border-r-gray-900 border-t-8 border-t-transparent border-b-8 border-b-transparent',
          avatar: 'bg-green-600 text-white font-bold shadow-md',
          avatarText: 'CODE'
        };
      default:
        return {
          container: 'flex-row',
          bubble: 'bg-gray-600 text-white relative shadow-lg',
          arrow: 'absolute left-0 top-4 transform -translate-x-2 w-0 h-0 border-r-8 border-r-gray-600 border-t-8 border-t-transparent border-b-8 border-b-transparent',
          avatar: 'bg-gray-600 text-white font-bold shadow-md',
          avatarText: '?'
        };
    }
  };

  const styles = getBubbleStyles();

  // Handle system messages differently - no bubble, just centered text
  if (message.type === 'system') {
    return (
      <div className="flex justify-center mb-6">
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  // Skip rendering command messages as separate bubbles - they should be part of AI responses
  if (message.type === 'command') {
    return null;
  }

  return (
    <div className={`flex items-start space-x-3 mb-6 ${styles.container}`}>
      {/* Profile Picture */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-lg ${styles.avatar}`}>
        {styles.avatarText}
      </div>

      {/* Message Content */}
      <div className={`max-w-2xl lg:max-w-3xl xl:max-w-4xl relative ${isUser ? 'mr-3' : 'ml-3'}`}>
        {/* Speech Bubble */}
        <div className={`px-4 py-3 rounded-2xl shadow-lg ${styles.bubble}`}>
          {/* Arrow pointing to profile */}
          <div className={styles.arrow}></div>
          
          {/* Message Content */}
          <div className="relative z-10">
            {message.type === 'code' ? (
              <pre className="whitespace-pre-wrap text-sm">
                <code>{message.content}</code>
              </pre>
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            )}

            {/* Command metadata - terminal-like display */}
            {message.metadata?.command && (
              <div className="mt-4">
                {/* Terminal header */}
                <div className="bg-gray-800 rounded-t-lg px-3 py-2 border-b border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">Terminal</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Exit: {message.metadata.command.exitCode ?? 'Running'}
                    </div>
                  </div>
                </div>
                
                {/* Terminal content */}
                <div className="bg-black rounded-b-lg p-4 font-mono text-sm">
                  {/* Command prompt */}
                  <div className="text-green-400 mb-2">
                    <span className="text-blue-400">$</span> {
                      message.metadata.command.command || 
                      (message.metadata.command.name && message.metadata.command.args ? 
                        `${message.metadata.command.name} ${message.metadata.command.args.join(' ')}` : 
                        message.content)
                    }
                  </div>
                  
                  {/* Command output */}
                  {message.metadata.command.output && (
                    <pre className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {message.metadata.command.output}
                    </pre>
                  )}
                  
                  {/* Running indicator */}
                  {message.metadata.command.exitCode === undefined && (
                    <div className="flex items-center space-x-2 text-yellow-400 mt-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="text-xs">Running...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {message.status === 'sending' && (
              <div className="mt-3 flex items-center space-x-2 text-xs opacity-70">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span>Sending...</span>
              </div>
            )}
          </div>
        </div>

        {/* Timestamp */}
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
