export interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  category: 'web' | 'backend' | 'data' | 'mobile' | 'devops' | 'ai' | 'game';
  icon: string;
  tags: string[];
  
  // Template configuration
  config: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    dependencies: Record<string, string>;
    ports: number[];
    environment: Record<string, string>;
    scripts: Record<string, string>;
  };
  
  // Resource requirements
  resources: {
    cpu: number;
    memory: number;
    storage: number;
    gpu?: boolean;
  };
  
  // Template metadata
  metadata: {
    author: string;
    version: string;
    createdAt: Date;
    updatedAt: Date;
    downloads: number;
    rating: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedSetupTime: number; // in minutes
  };
  
  // Repository and files
  repository?: {
    url: string;
    branch: string;
    subPath?: string;
  };
  
  files?: {
    path: string;
    content: string;
    template?: boolean; // if true, content contains template variables
  }[];
  
  // Installation steps
  setup: {
    steps: {
      name: string;
      description: string;
      command?: string;
      files?: { path: string; content: string }[];
      conditional?: string; // condition to run this step
    }[];
    postInstall?: string[]; // commands to run after setup
  };
  
  // Documentation
  documentation: {
    readme: string;
    quickStart: string;
    examples?: {
      name: string;
      description: string;
      code: string;
    }[];
  };
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  templates: WorkspaceTemplate[];
}

export interface TemplateFilter {
  category?: string;
  language?: string;
  framework?: string;
  difficulty?: string;
  search?: string;
  tags?: string[];
}

export interface TemplateInstallation {
  templateId: string;
  workspaceId: string;
  status: 'pending' | 'installing' | 'completed' | 'failed';
  progress: number;
  currentStep?: string;
  logs: string[];
  startTime: Date;
  endTime?: Date;
  error?: string;
}