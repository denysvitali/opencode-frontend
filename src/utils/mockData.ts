import type { Conversation } from '../types/index.js';

export function createMockData(): Conversation[] {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  const conversations: Conversation[] = [
    {
      id: '1',
      title: 'React App Development',
      createdAt: twoDaysAgo,
      updatedAt: oneHourAgo,
      sandboxStatus: 'connected',
      messages: [
        {
          id: 'm1',
          conversationId: '1',
          type: 'user',
          content: 'Help me create a React app with TypeScript',
          status: 'sent',
          timestamp: twoDaysAgo,
        },
        {
          id: 'm2',
          conversationId: '1',
          type: 'assistant',
          content: 'I\'ll help you create a React app with TypeScript. Let me start by setting up the project structure.',
          status: 'sent',
          timestamp: new Date(twoDaysAgo.getTime() + 5 * 60 * 1000),
        },
        {
          id: 'm3',
          conversationId: '1',
          type: 'command',
          content: 'npx create-react-app my-app --template typescript',
          status: 'sent',
          timestamp: new Date(twoDaysAgo.getTime() + 10 * 60 * 1000),
          metadata: {
            command: {
              name: 'npx',
              args: ['create-react-app', 'my-app', '--template', 'typescript'],
              exitCode: 0,
              output: 'Successfully created React app with TypeScript!'
            }
          }
        }
      ]
    },
    {
      id: '2',
      title: 'API Integration',
      createdAt: oneHourAgo,
      updatedAt: now,
      sandboxStatus: 'connecting',
      messages: [
        {
          id: 'm4',
          conversationId: '2',
          type: 'user',
          content: 'How do I integrate with a REST API?',
          status: 'sent',
          timestamp: oneHourAgo,
        },
        {
          id: 'm5',
          conversationId: '2',
          type: 'assistant',
          content: 'I\'ll show you how to integrate with a REST API using fetch and async/await.',
          status: 'sent',
          timestamp: new Date(oneHourAgo.getTime() + 2 * 60 * 1000),
        }
      ]
    },
    {
      id: '3',
      title: 'Database Design',
      createdAt: now,
      updatedAt: now,
      sandboxStatus: 'disconnected',
      messages: []
    }
  ];

  return conversations;
}
