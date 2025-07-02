import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Code, Terminal, FileText } from 'lucide-react';
import MessageBubble from './MessageBubble.js';
import type { Message } from '../../types/index.js';

interface ChatInterfaceProps {
  sessionId: string;
  workspaceId: string;
}

// Mock data for demonstration
const generateMockMessages = (sessionId: string): Message[] => [
  {
    id: 'msg-1',
    sessionId,
    type: 'system',
    content: 'Session started. Your development environment is ready.',
    status: 'delivered',
    timestamp: new Date(Date.now() - 300000), // 5 minutes ago
  },
  {
    id: 'msg-2',
    sessionId,
    type: 'user',
    content: 'Help me create a new React component for user authentication',
    status: 'delivered',
    timestamp: new Date(Date.now() - 240000), // 4 minutes ago
  },
  {
    id: 'msg-3',
    sessionId,
    type: 'assistant',
    content: 'I\'ll help you create a React authentication component. Let me start by creating a basic login form with email and password fields, including proper validation and error handling.',
    status: 'delivered',
    timestamp: new Date(Date.now() - 230000), // ~4 minutes ago
  },
  {
    id: 'msg-4',
    sessionId,
    type: 'code',
    content: `import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSubmit, 
  isLoading = false 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\\S+@\\S+\\.\\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(email, password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
          />
        </div>
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
};`,
    status: 'delivered',
    timestamp: new Date(Date.now() - 220000),
    metadata: {
      code: {
        language: 'typescript',
        filename: 'LoginForm.tsx'
      }
    }
  },
  {
    id: 'msg-5',
    sessionId,
    type: 'user',
    content: 'This looks great! Can you also show me how to integrate this with a backend API?',
    status: 'delivered',
    timestamp: new Date(Date.now() - 180000), // 3 minutes ago
  },
  {
    id: 'msg-6',
    sessionId,
    type: 'assistant',
    content: 'Absolutely! Let me show you how to create an authentication service that handles API calls, token management, and error handling.',
    status: 'delivered',
    timestamp: new Date(Date.now() - 170000),
  },
  {
    id: 'msg-7',
    sessionId,
    type: 'command',
    content: 'npm install axios @types/axios',
    status: 'delivered',
    timestamp: new Date(Date.now() - 160000),
    metadata: {
      command: {
        name: 'npm',
        args: ['install', 'axios', '@types/axios'],
        exitCode: 0,
        output: 'added 2 packages, and audited 1423 packages in 2s\n\n12 packages are looking for funding\n  run `npm fund` for details\n\nfound 0 vulnerabilities'
      }
    }
  }
];

export default function ChatInterface({ sessionId, workspaceId }: ChatInterfaceProps) {
  void workspaceId; // TODO: Use workspaceId for workspace-specific functionality
  const [messages, setMessages] = useState<Message[]>(() => generateMockMessages(sessionId));
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sessionId,
      type: 'user',
      content: input.trim(),
      status: 'sent',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I'll help you with that. Let me analyze your request and provide a solution.",
        "Great question! Here's how I would approach this problem...",
        "Let me break that down for you and show you the best practices.",
        "I understand what you're looking for. Let me create an example for you.",
        "That's an interesting challenge. Here's a comprehensive solution:",
      ];

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        sessionId,
        type: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        status: 'delivered',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const quickActions = [
    { icon: Code, label: 'Generate Code', prompt: 'Help me write some code for...' },
    { icon: Terminal, label: 'Run Command', prompt: 'Run the command: ' },
    { icon: FileText, label: 'Explain Code', prompt: 'Can you explain this code: ' },
    { icon: Bot, label: 'Debug Issue', prompt: 'I have a bug in my code: ' },
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 max-w-md">
              <Bot className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Ready to Code!</h3>
              <p className="text-gray-400 mb-6">
                Start a conversation with your AI coding assistant. Ask questions, get help with code, or explore your workspace.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => setInput(action.prompt)}
                      className="flex items-center gap-2 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm text-gray-300 hover:text-white"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="truncate">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-start space-x-3 mb-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                  AI
                </div>
                <div className="bg-gray-700 rounded-2xl px-4 py-3 max-w-xs lg:max-w-md xl:max-w-lg">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 bg-white/5 backdrop-blur-xl p-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about your code..."
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none min-h-[48px] max-h-32"
                rows={1}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl transition-colors text-white"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
              {isLoading ? 'Processing...' : 'Ready'}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}