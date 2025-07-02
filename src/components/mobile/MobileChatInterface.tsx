import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, Smile } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore.js';

interface MobileChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface MobileChatInterfaceProps {
  messages: MobileChatMessage[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export function MobileChatInterface({
  messages,
  onSendMessage,
  isLoading = false,
  placeholder = "Type a message...",
  className = ''
}: MobileChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useUIStore();

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max 5 lines
      textarea.style.height = `${newHeight}px`;
    }
  };

  // Handle keyboard visibility on mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleResize = () => {
      const visualViewport = window.visualViewport;
      if (visualViewport) {
        const keyboardHeight = window.innerHeight - visualViewport.height;
        setKeyboardHeight(Math.max(0, keyboardHeight));
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => {
        window.visualViewport?.removeEventListener('resize', handleResize);
      };
    }
  }, [isMobile]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      adjustTextareaHeight();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    adjustTextareaHeight();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const startRecording = () => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    setIsRecording(true);
    // TODO: Implement voice recording
  };

  const stopRecording = () => {
    setIsRecording(false);
    // TODO: Process voice recording
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: MobileChatMessage) => {
    const isUser = message.type === 'user';
    
    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className="max-w-[85%] sm:max-w-[70%]">
          {/* Avatar for assistant messages */}
          {!isUser && (
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                <span className="text-xs text-white font-medium">AI</span>
              </div>
              <span className="text-xs text-gray-400">Assistant</span>
            </div>
          )}
          
          {/* Message bubble */}
          <div
            className={`
              px-4 py-3 rounded-2xl
              ${isUser 
                ? 'bg-blue-600 text-white rounded-br-md' 
                : 'bg-gray-700 text-gray-100 rounded-bl-md'
              }
              ${message.isLoading ? 'animate-pulse' : ''}
            `}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
            
            {/* Timestamp */}
            <div className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-400'}`}>
              {formatTime(message.timestamp)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full bg-gray-900 ${className}`}>
      {/* Messages Container */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ paddingBottom: keyboardHeight ? '0' : '20px' }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-gray-800 rounded-full p-6 mb-6">
              <Smile className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Ready to Chat!
            </h3>
            <p className="text-gray-400 text-sm max-w-sm">
              Start a conversation with your AI assistant. Ask questions, get help with code, or brainstorm ideas.
            </p>
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="max-w-[85%] sm:max-w-[70%]">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs text-white font-medium">AI</span>
                    </div>
                    <span className="text-xs text-gray-400">Assistant</span>
                  </div>
                  <div className="bg-gray-700 text-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-gray-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Container */}
      <div 
        className="bg-gray-800 border-t border-gray-700 p-4 safe-area-bottom"
        style={{ marginBottom: keyboardHeight }}
      >
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          {/* Attachment Button */}
          <button
            type="button"
            className="flex-shrink-0 p-2 text-gray-400 hover:text-white transition-colors rounded-lg active:bg-gray-700"
            aria-label="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          {/* Input Field */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              rows={1}
              className="
                w-full px-4 py-3 pr-12
                bg-gray-700 border border-gray-600
                rounded-2xl text-white placeholder-gray-400
                resize-none scrollbar-hide
                focus:outline-none focus:border-blue-500
                text-sm leading-relaxed
              "
              style={{ minHeight: '44px' }}
              disabled={isLoading}
            />
            
            {/* Emoji Button */}
            <button
              type="button"
              className="absolute right-3 bottom-3 p-1 text-gray-400 hover:text-white transition-colors rounded"
              aria-label="Add emoji"
            >
              <Smile className="h-4 w-4" />
            </button>
          </div>

          {/* Voice/Send Button */}
          {inputValue.trim() ? (
            <button
              type="submit"
              disabled={isLoading}
              className="
                flex-shrink-0 p-3
                bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                text-white rounded-full
                transition-all duration-200
                active:scale-95
              "
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`
                flex-shrink-0 p-3
                ${isRecording ? 'bg-red-600' : 'bg-gray-600 hover:bg-gray-700'}
                text-white rounded-full
                transition-all duration-200
                active:scale-95
              `}
              aria-label={isRecording ? 'Recording...' : 'Hold to record'}
            >
              <Mic className="h-5 w-5" />
            </button>
          )}
        </form>

        {/* Quick Actions */}
        <div className="flex items-center justify-center mt-3 space-x-4">
          <button
            type="button"
            className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-xs transition-colors"
            onClick={() => setInputValue('Help me debug this code')}
          >
            <span>🐛</span>
            <span>Debug</span>
          </button>
          
          <button
            type="button"
            className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-xs transition-colors"
            onClick={() => setInputValue('Explain this concept')}
          >
            <span>💡</span>
            <span>Explain</span>
          </button>
          
          <button
            type="button"
            className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-xs transition-colors"
            onClick={() => setInputValue('Write code for')}
          >
            <span>⚡</span>
            <span>Code</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileChatInterface;