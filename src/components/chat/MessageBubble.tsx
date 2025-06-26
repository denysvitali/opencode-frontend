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
          bubble: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white relative',
          arrow: 'absolute right-0 top-4 transform translate-x-2 w-0 h-0 border-l-8 border-l-blue-500 border-t-8 border-t-transparent border-b-8 border-b-transparent',
          avatar: 'bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold',
          avatarText: 'You'
        };
      case 'assistant':
        return {
          container: 'flex-row',
          bubble: 'bg-gradient-to-br from-gray-700 to-gray-800 text-white relative',
          arrow: 'absolute left-0 top-4 transform -translate-x-2 w-0 h-0 border-r-8 border-r-gray-700 border-t-8 border-t-transparent border-b-8 border-b-transparent',
          avatar: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold',
          avatarText: 'AI'
        };
      case 'system':
        return {
          container: 'flex-row',
          bubble: 'bg-gradient-to-br from-amber-600 to-orange-600 text-white relative',
          arrow: 'absolute left-0 top-4 transform -translate-x-2 w-0 h-0 border-r-8 border-r-amber-600 border-t-8 border-t-transparent border-b-8 border-b-transparent',
          avatar: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold',
          avatarText: 'SYS'
        };
      case 'command':
        return {
          container: 'flex-row',
          bubble: 'bg-gradient-to-br from-purple-600 to-violet-700 text-white relative font-mono',
          arrow: 'absolute left-0 top-4 transform -translate-x-2 w-0 h-0 border-r-8 border-r-purple-600 border-t-8 border-t-transparent border-b-8 border-b-transparent',
          avatar: 'bg-gradient-to-br from-purple-500 to-violet-600 text-white font-bold',
          avatarText: 'CMD'
        };
      case 'code':
        return {
          container: 'flex-row',
          bubble: 'bg-gradient-to-br from-slate-700 to-slate-800 text-green-400 relative font-mono border border-slate-600',
          arrow: 'absolute left-0 top-4 transform -translate-x-2 w-0 h-0 border-r-8 border-r-slate-700 border-t-8 border-t-transparent border-b-8 border-b-transparent',
          avatar: 'bg-gradient-to-br from-slate-600 to-slate-700 text-green-400 font-bold',
          avatarText: 'CODE'
        };
      default:
        return {
          container: 'flex-row',
          bubble: 'bg-gradient-to-br from-gray-600 to-gray-700 text-white relative',
          arrow: 'absolute left-0 top-4 transform -translate-x-2 w-0 h-0 border-r-8 border-r-gray-600 border-t-8 border-t-transparent border-b-8 border-b-transparent',
          avatar: 'bg-gradient-to-br from-gray-500 to-gray-600 text-white font-bold',
          avatarText: '?'
        };
    }
  };

  const styles = getBubbleStyles();

  return (
    <div className={`flex items-start space-x-3 mb-6 ${styles.container}`}>
      {/* Profile Picture */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-lg ${styles.avatar}`}>
        {styles.avatarText}
      </div>

      {/* Message Content */}
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg relative ${isUser ? 'mr-3' : 'ml-3'}`}>
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

            {/* Command metadata */}
            {message.metadata?.command && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="text-xs opacity-80">
                  <div className="flex items-center space-x-2">
                    <span>Exit Code: {message.metadata.command.exitCode ?? 'Running'}</span>
                  </div>
                  {message.metadata.command.output && (
                    <div className="mt-2 p-2 bg-black/30 rounded-lg">
                      <pre className="text-xs text-green-300 whitespace-pre-wrap">
                        {message.metadata.command.output}
                      </pre>
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
