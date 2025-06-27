import type { DataService } from './dataService.js';
import type { Conversation, Message } from '../types/index.js';
import { createMockData } from '../utils/mockData.js';

/**
 * Mock data service for demo mode
 * Uses the existing mock data to simulate API responses
 */
export class MockDataService implements DataService {
  private conversations: Conversation[] = [];
  private messages: Map<string, Message[]> = new Map();

  constructor() {
    // Initialize with mock data
    this.conversations = createMockData();
    
    // Extract messages from conversations
    this.conversations.forEach(conv => {
      this.messages.set(conv.id, [...conv.messages]);
    });
  }

  async checkHealth() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      status: 'connected' as const,
      version: 'mock-1.0.0',
    };
  }

  async loadConversations(): Promise<Conversation[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return [...this.conversations];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createConversation(title: string, ..._args: unknown[]): Promise<Conversation> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      title,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      sandboxStatus: 'connecting',
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
    await new Promise(resolve => setTimeout(resolve, 200));
    
    this.conversations = this.conversations.filter(c => c.id !== conversationId);
    this.messages.delete(conversationId);
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const conversation = this.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    return { ...conversation };
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      type: 'user',
      content,
      status: 'sent',
      timestamp: new Date(),
    };

    // Add user message
    const messages = this.messages.get(conversationId) || [];
    messages.push(userMessage);
    this.messages.set(conversationId, messages);

    // Update conversation
    const conversation = this.conversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.messages = [...messages];
      conversation.updatedAt = new Date();
    }

    // Simulate AI response after a delay
    setTimeout(async () => {
      const aiMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        conversationId,
        type: 'assistant',
        content: this.generateMockAIResponse(),
        status: 'sent',
        timestamp: new Date(),
      };

      const currentMessages = this.messages.get(conversationId) || [];
      currentMessages.push(aiMessage);
      this.messages.set(conversationId, currentMessages);

      // Update conversation
      const conv = this.conversations.find(c => c.id === conversationId);
      if (conv) {
        conv.messages = [...currentMessages];
        conv.updatedAt = new Date();
      }
    }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds

    return userMessage;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return [...(this.messages.get(conversationId) || [])];
  }

  async getFiles(): Promise<Array<{ path: string; type: 'file' | 'directory' }>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Return mock file structure
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

  async getFileContent(_conversationId: string, filePath: string): Promise<{ content: string; language?: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Return mock file content based on file type
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

  async executeCommand(_conversationId: string, command: string): Promise<{ output: string; exitCode: number }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock command output
    const mockOutput = this.getMockCommandOutput(command);
    
    return {
      output: mockOutput,
      exitCode: 0,
    };
  }

  async getTerminalHistory(): Promise<Array<{ command: string; output: string; timestamp: Date }>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return mock terminal history
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

  async getGitStatus(): Promise<{
    status: string;
    files: Array<{ path: string; status: 'modified' | 'added' | 'deleted' | 'untracked' }>;
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Return mock git status
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
}
