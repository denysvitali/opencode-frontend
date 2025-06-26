import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { X, Copy, Download, FileText } from 'lucide-react';

interface FileContentViewerProps {
  filePath: string;
  fileName: string;
  onClose: () => void;
}

// Mock file contents based on file path
const getMockFileContent = (filePath: string): string => {
  const fileContents: Record<string, string> = {
    '/src/App.tsx': `import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useUIStore } from './stores/uiStore.js';
import { useAppStore } from './stores/appStore.js';
import Layout from './components/layout/Layout.js';
import MainView from './components/layout/MainView.js';
import { createMockData } from './utils/mockData.js';

function App() {
  const { setIsMobile } = useUIStore();
  const { conversations, setActiveConversation } = useAppStore();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

  // Initialize with mock data if no conversations exist
  useEffect(() => {
    if (conversations.length === 0) {
      const mockConversations = createMockData();
      const store = useAppStore.getState();
      
      mockConversations.forEach(conv => {
        store.addConversation(conv);
      });
      
      // Set the first conversation as active
      if (mockConversations.length > 0) {
        setActiveConversation(mockConversations[0].id);
      }
    }
  }, [conversations.length, setActiveConversation]);

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-gray-900 text-white">
        <Layout>
          <MainView />
        </Layout>
      </div>
    </Router>
  );
}

export default App;`,
    '/src/components/chat/ChatView.tsx': `import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, MicOff } from 'lucide-react';
import { useAppStore } from '../../stores/appStore.js';
import MessageBubble from './MessageBubble.js';
import type { Message } from '../../types/index.js';

export default function ChatView() {
  const { activeConversation, addMessage } = useAppStore();
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !activeConversation) return;

    const newMessage: Omit<Message, 'id'> = {
      conversationId: activeConversation.id,
      type: 'user',
      content: message.trim(),
      status: 'sent',
      timestamp: new Date(),
    };

    addMessage(newMessage);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Omit<Message, 'id'> = {
        conversationId: activeConversation.id,
        type: 'assistant',
        content: 'This is a mock response from the AI assistant.',
        status: 'sent',
        timestamp: new Date(),
      };
      addMessage(aiResponse);
    }, 1000);
  };

  if (!activeConversation) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No conversation selected</h2>
          <p>Select a conversation from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {activeConversation.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-700 p-6">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message..."
              className="w-full p-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>
          
          <div className="flex gap-2">
            <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl transition-colors">
              <Paperclip className="h-5 w-5" />
            </button>
            
            <button 
              onClick={() => setIsRecording(!isRecording)}
              className={\`p-3 rounded-xl transition-colors \${
                isRecording 
                  ? 'text-red-400 bg-red-900/20 hover:bg-red-900/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }\`}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}`,
    '/package.json': `{
  "name": "opencode-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "@monaco-editor/react": "^4.6.0",
    "lucide-react": "^0.263.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.15.0",
    "zustand": "^4.4.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.14",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "postcss": "^8.4.27",
    "tailwindcss": "^3.3.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}`,
    '/README.md': `# OpenCode Frontend

A modern React-based frontend for the OpenCode AI assistant platform.

## Features

- 💬 **Chat Interface**: Interactive conversation with AI assistant
- 📁 **File Explorer**: Browse and view project files with syntax highlighting
- 🔧 **Terminal View**: Monitor AI commands and their outputs
- 🔄 **Git Integration**: View git diffs and file changes
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Beautiful dark theme with smooth animations

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **Monaco Editor** for code highlighting
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd opencode-frontend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open your browser and navigate to \`http://localhost:5173\`

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build
- \`npm run lint\` - Run ESLint

## Project Structure

\`\`\`
src/
├── components/
│   ├── chat/           # Chat-related components
│   ├── filesystem/     # File explorer and git diff views
│   ├── layout/         # Layout components (header, sidebar, navigation)
│   ├── terminal/       # Terminal view components
│   └── ui/            # Reusable UI components
├── hooks/             # Custom React hooks
├── services/          # API services and utilities
├── stores/            # Zustand state stores
├── types/             # TypeScript type definitions
└── utils/             # Utility functions and mock data
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.`
  };

  return fileContents[filePath] || `// File content for ${filePath}
// This is mock content - in a real application, this would be loaded from the actual file

export default function MockComponent() {
  return (
    <div>
      <h1>Mock File Content</h1>
      <p>This file would contain the actual source code for: {filePath}</p>
    </div>
  );
}`;
};

const getLanguageFromFileName = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    case 'css':
      return 'css';
    case 'html':
      return 'html';
    case 'py':
      return 'python';
    case 'java':
      return 'java';
    case 'cpp':
    case 'cc':
    case 'cxx':
      return 'cpp';
    case 'c':
      return 'c';
    case 'sh':
      return 'shell';
    case 'yml':
    case 'yaml':
      return 'yaml';
    case 'xml':
      return 'xml';
    case 'sql':
      return 'sql';
    default:
      return 'plaintext';
  }
};

export default function FileContentViewer({ filePath, fileName, onClose }: FileContentViewerProps) {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading file content
    setIsLoading(true);
    setTimeout(() => {
      setContent(getMockFileContent(filePath));
      setIsLoading(false);
    }, 300);
  }, [filePath]);

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const language = getLanguageFromFileName(fileName);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-blue-400" />
            <div>
              <h2 className="font-semibold text-white">{fileName}</h2>
              <p className="text-sm text-gray-400">{filePath}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyContent}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Copy content"
            >
              <Copy className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleDownload}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Download file"
            >
              <Download className="h-4 w-4" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-gray-400">Loading file content...</div>
            </div>
          ) : (
            <Editor
              height="100%"
              language={language}
              value={content}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                renderLineHighlight: 'line',
                selectOnLineNumbers: true,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                folding: true,
                lineNumbers: 'on',
                rulers: [80, 120],
                bracketPairColorization: {
                  enabled: true
                }
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-700 text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <span>Language: {language}</span>
            <span>•</span>
            <span>Lines: {content.split('\n').length}</span>
            <span>•</span>
            <span>Characters: {content.length}</span>
          </div>
          <div>
            Read-only mode
          </div>
        </div>
      </div>
    </div>
  );
}
