import type { DataService } from './dataService.js';
import type { Conversation, Message, Workspace, Session } from '../types/index.js';
import { createMockData } from '../utils/mockData.js';

/**
 * Mock data service for demo mode
 * Uses the existing mock data to simulate API responses
 */
export class MockDataService implements DataService {
  private conversations: Conversation[] = [];
  private messages: Map<string, Message[]> = new Map();
  private workspaces: Workspace[] = [];
  private sessions: Session[] = [];
  private globalMessages: Message[] = [];

  constructor() {
    // Initialize with mock data
    this.conversations = createMockData();
    
    // Extract messages from conversations
    this.conversations.forEach(conv => {
      this.messages.set(conv.id, [...conv.messages]);
    });

    // Initialize mock workspaces and sessions
    this.initializeMockWorkspaces();
  }

  async checkHealth() {
    // Simulate API delay
    // Removed artificial delay for performance
    
    return {
      status: 'connected' as const,
      version: 'mock-1.0.0',
    };
  }

  async loadConversations(): Promise<Conversation[]> {
    // Simulate API delay
    // Removed artificial delay for performance
    
    return [...this.conversations];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createConversation(title: string, ..._args: unknown[]): Promise<Conversation> {
    // Simulate API delay
    // Removed artificial delay for performance
    
    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      title,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      sandboxStatus: 'connecting',
      workspaceId: 'ws-default',
    };

    this.conversations.unshift(newConversation);
    this.messages.set(newConversation.id, []);

    // Simulate sandbox startup
    setTimeout(() => {
      const conv = this.conversations.find(c => c.id === newConversation.id);
      if (conv) {
        conv.sandboxStatus = 'connected';
      }
    }, 2000);

    return newConversation;
  }

  async deleteConversation(conversationId: string): Promise<void> {
    // Simulate API delay
    // Removed artificial delay for performance
    
    this.conversations = this.conversations.filter(c => c.id !== conversationId);
    this.messages.delete(conversationId);
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    // Simulate API delay
    // Removed artificial delay for performance
    
    const conversation = this.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    return { ...conversation };
  }


  // Workspace methods
  async loadWorkspaces(): Promise<Workspace[]> {
    console.log('MockDataService: loadWorkspaces called');
    // Removed artificial delay for performance
    console.log('MockDataService: Returning workspaces:', this.workspaces.length, 'items');
    console.log('MockDataService: Workspace details:', this.workspaces.map(w => ({ id: w.id, name: w.name, status: w.status })));
    return [...this.workspaces];
  }

  async createWorkspace(name: string, repositoryUrl?: string): Promise<Workspace> {
    // Removed artificial delay for performance
    
    const newWorkspace: Workspace = {
      id: `ws_${Date.now()}`,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'creating',
      config: repositoryUrl ? { repository: { url: repositoryUrl, ref: 'main' } } : undefined,
      labels: { 'created-by': 'mock-service' },
      userId: 'default-user',
    };

    this.workspaces.push(newWorkspace);
    
    // Simulate workspace becoming ready
    setTimeout(() => {
      newWorkspace.status = 'running';
      newWorkspace.updatedAt = new Date();
    }, 1000);

    return newWorkspace;
  }

  async deleteWorkspace(workspaceId: string): Promise<void> {
    // Removed artificial delay for performance
    
    const index = this.workspaces.findIndex(ws => ws.id === workspaceId);
    if (index >= 0) {
      this.workspaces.splice(index, 1);
    }
    
    // Also remove sessions for this workspace
    this.sessions = this.sessions.filter(s => s.workspaceId !== workspaceId);
    this.globalMessages = this.globalMessages.filter(m => {
      const session = this.sessions.find(s => s.id === m.sessionId);
      return session?.workspaceId !== workspaceId;
    });
  }

  async getWorkspace(workspaceId: string): Promise<Workspace> {
    // Removed artificial delay for performance
    
    const workspace = this.workspaces.find(ws => ws.id === workspaceId);
    if (!workspace) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }
    
    return workspace;
  }

  // Session methods
  async loadSessions(workspaceId: string): Promise<Session[]> {
    // Removed artificial delay for performance
    return this.sessions.filter(s => s.workspaceId === workspaceId);
  }

  async createSession(workspaceId: string, name: string): Promise<Session> {
    // Removed artificial delay for performance
    
    const newSession: Session = {
      id: `sess_${Date.now()}`,
      name,
      workspaceId,
      createdAt: new Date(),
      updatedAt: new Date(),
      state: 'creating',
      config: { context: 'Interactive coding session' },
      labels: { 'created-by': 'mock-service' },
      userId: 'default-user',
    };

    this.sessions.push(newSession);
    
    // Simulate session becoming ready
    setTimeout(() => {
      newSession.state = 'running';
      newSession.updatedAt = new Date();
    }, 1000);

    return newSession;
  }

  async deleteSession(workspaceId: string, sessionId: string): Promise<void> {
    // Removed artificial delay for performance
    
    const index = this.sessions.findIndex(s => s.id === sessionId && s.workspaceId === workspaceId);
    if (index >= 0) {
      this.sessions.splice(index, 1);
    }
    
    // Also remove messages for this session
    this.globalMessages = this.globalMessages.filter(m => m.sessionId !== sessionId);
  }

  async getSession(workspaceId: string, sessionId: string): Promise<Session> {
    // Removed artificial delay for performance
    
    const session = this.sessions.find(s => s.id === sessionId && s.workspaceId === workspaceId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found in workspace ${workspaceId}`);
    }
    
    return session;
  }

  // Message methods (updated for sessions)
  async sendMessage(_workspaceId: string, sessionId: string, content: string): Promise<Message> {
    // Removed artificial delay for performance
    
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      sessionId,
      type: 'user',
      content,
      status: 'sent',
      timestamp: new Date(),
    };

    this.globalMessages.push(userMessage);

    // Update session
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      session.updatedAt = new Date();
    }

    // Simulate AI response after a delay
    setTimeout(async () => {
      const aiMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        sessionId,
        type: 'assistant',
        content: this.generateMockAIResponse(),
        status: 'sent',
        timestamp: new Date(),
      };

      this.globalMessages.push(aiMessage);

      // Update session again
      if (session) {
        session.updatedAt = new Date();
      }
    }, 1000 + Math.random() * 2000);

    return userMessage;
  }

  async getMessages(_workspaceId: string, sessionId: string): Promise<Message[]> {
    // Removed artificial delay for performance
    return this.globalMessages.filter(m => m.sessionId === sessionId);
  }

  // File methods (updated for sessions)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getFiles(_workspaceId: string, _sessionId: string): Promise<Array<{ path: string; type: 'file' | 'directory' }>> {
    // Removed artificial delay for performance
    
    return [
      { path: '/src', type: 'directory' },
      { path: '/src/App.tsx', type: 'file' },
      { path: '/src/index.tsx', type: 'file' },
      { path: '/src/components', type: 'directory' },
      { path: '/src/components/Header.tsx', type: 'file' },
      { path: '/package.json', type: 'file' },
      { path: '/README.md', type: 'file' },
      { path: '/tsconfig.json', type: 'file' },
    ];
  }

  async getFileContent(_workspaceId: string, _sessionId: string, filePath: string): Promise<{ content: string; language?: string }> {
    // Removed artificial delay for performance
    
    const mockContent = this.getMockFileContent(filePath);
    const extension = filePath.split('.').pop()?.toLowerCase();
    
    const languageMap: Record<string, string> = {
      'tsx': 'typescript',
      'ts': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'json': 'json',
      'md': 'markdown',
    };

    return {
      content: mockContent,
      language: extension ? languageMap[extension] : undefined,
    };
  }

  // Terminal methods (updated for sessions)
  async executeCommand(_workspaceId: string, _sessionId: string, command: string): Promise<{ output: string; exitCode: number }> {
    // Removed artificial delay for performance
    
    const mockOutput = this.getMockCommandOutput(command);
    
    return {
      output: mockOutput,
      exitCode: 0,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getTerminalHistory(_workspaceId: string, _sessionId: string): Promise<Array<{ command: string; output: string; timestamp: Date }>> {
    // Removed artificial delay for performance
    
    return [
      {
        command: 'npm install',
        output: 'added 1337 packages in 5.2s',
        timestamp: new Date(Date.now() - 60000),
      },
      {
        command: 'npm run build',
        output: 'Successfully compiled!',
        timestamp: new Date(Date.now() - 30000),
      },
    ];
  }

  // Git methods (updated for sessions)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getGitStatus(_workspaceId: string, _sessionId: string): Promise<{
    status: string;
    files: Array<{ path: string; status: 'modified' | 'added' | 'deleted' | 'untracked' }>;
  }> {
    // Removed artificial delay for performance
    
    return {
      status: 'dirty',
      files: [
        { path: 'src/App.tsx', status: 'modified' },
        { path: 'src/components/NewComponent.tsx', status: 'added' },
        { path: 'README.md', status: 'modified' },
      ],
    };
  }

  getCurrentEndpoint(): string {
    return 'mock://localhost:9091';
  }

  configure(): void {
    // No-op for mock service
  }

  private generateMockAIResponse(): string {
    const responses = [
      "I'll help you with that! Let me analyze your request and provide a solution.",
      "Great question! Here's what I recommend based on your requirements.",
      "I understand what you're looking for. Let me implement that for you.",
      "That's an interesting challenge. Here's my approach to solve it.",
      "I can definitely help with that. Let me show you how to implement this.",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getMockFileContent(filePath: string): string {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      return `import React from 'react';\n\nfunction Component() {\n  return <div>Hello World</div>;\n}\n\nexport default Component;`;
    }
    
    if (filePath.endsWith('.json')) {
      return `{\n  "name": "my-app",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.0.0"\n  }\n}`;
    }
    
    if (filePath.endsWith('.md')) {
      return `# My Project\n\nThis is a demo project created with OpenCode.`;
    }
    
    return `// Content for ${filePath}\nconsole.log('Hello from ${filePath}');`;
  }

  private getMockCommandOutput(command: string): string {
    if (command.includes('npm')) {
      return 'npm command executed successfully\npackages installed: 42\ntime: 2.3s';
    }
    
    if (command.includes('git')) {
      return 'On branch main\nYour branch is up to date with origin/main';
    }
    
    if (command.includes('ls')) {
      return 'src/\npackage.json\nREADME.md\ntsconfig.json';
    }
    
    return `Command "${command}" executed successfully`;
  }

  private initializeMockWorkspaces(): void {
    // Create some mock workspaces
    this.workspaces = [
      {
        id: 'ws-1',
        name: 'E-commerce Platform',
        createdAt: new Date(Date.now() - 86400000 * 7), // 7 days ago
        updatedAt: new Date(Date.now() - 3600000), // 1 hour ago
        status: 'running',
        config: {
          repository: {
            url: 'https://github.com/user/ecommerce-platform',
            ref: 'main'
          }
        },
        labels: { 'created-by': 'mock-service', 'project-type': 'web-app' },
        userId: 'default-user',
      },
      {
        id: 'ws-2',
        name: 'Mobile App Backend',
        createdAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
        updatedAt: new Date(Date.now() - 7200000), // 2 hours ago
        status: 'running',
        config: {
          repository: {
            url: 'https://github.com/user/mobile-backend',
            ref: 'develop'
          }
        },
        labels: { 'created-by': 'mock-service', 'project-type': 'api' },
        userId: 'default-user',
      },
      {
        id: 'ws-3',
        name: 'Data Pipeline',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        updatedAt: new Date(Date.now() - 1800000), // 30 minutes ago
        status: 'stopped',
        labels: { 'created-by': 'mock-service', 'project-type': 'data' },
        userId: 'default-user',
      }
    ];

    // Create some mock sessions
    this.sessions = [
      {
        id: 'sess-1',
        name: 'Frontend Development',
        workspaceId: 'ws-1',
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(Date.now() - 3600000),
        state: 'running',
        config: { context: 'Working on React components' },
        labels: { 'session-type': 'development', 'created-by': 'mock-service' },
        userId: 'default-user',
      },
      {
        id: 'sess-2',
        name: 'API Testing',
        workspaceId: 'ws-1',
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 7200000),
        state: 'stopped',
        config: { context: 'Testing payment endpoints' },
        labels: { 'session-type': 'testing', 'created-by': 'mock-service' },
        userId: 'default-user',
      },
      {
        id: 'sess-3',
        name: 'Database Setup',
        workspaceId: 'ws-2',
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(Date.now() - 1800000),
        state: 'running',
        config: { context: 'Setting up PostgreSQL schemas' },
        labels: { 'session-type': 'infrastructure', 'created-by': 'mock-service' },
        userId: 'default-user',
      }
    ];

    // Create some mock messages
    this.globalMessages = [
      {
        id: 'msg-1',
        sessionId: 'sess-1',
        type: 'user',
        content: 'Can you help me create a new React component for the product listing?',
        status: 'sent',
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: 'msg-2',
        sessionId: 'sess-1',
        type: 'assistant',
        content: 'I\'d be happy to help you create a product listing component! Let me create a new React component with proper TypeScript interfaces.',
        status: 'sent',
        timestamp: new Date(Date.now() - 3590000),
      },
      {
        id: 'msg-3',
        sessionId: 'sess-3',
        type: 'user',
        content: 'What\'s the best way to set up database migrations?',
        status: 'sent',
        timestamp: new Date(Date.now() - 1800000),
      },
      {
        id: 'msg-4',
        sessionId: 'sess-3',
        type: 'assistant',
        content: 'For database migrations, I recommend using a migration tool like Prisma or TypeORM. Let me show you how to set that up.',
        status: 'sent',
        timestamp: new Date(Date.now() - 1790000),
      }
    ];
  }
}
