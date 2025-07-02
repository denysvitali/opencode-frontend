import React, { useState, useCallback, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  GitBranch, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Server,
  FileText,
  Code,
  Database,
  Zap,
  Globe,
  Package
} from 'lucide-react';

export interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'web' | 'backend' | 'data' | 'mobile' | 'other';
  technologies: string[];
  features: string[];
  setupTime: string;
}

export interface RepositoryInfo {
  owner: string;
  name: string;
  description?: string;
  defaultBranch: string;
  branches: string[];
  isPrivate: boolean;
  lastUpdated: Date;
  stars?: number;
  language?: string;
}

export interface WorkspaceCreationData {
  name: string;
  description: string;
  template: WorkspaceTemplate | null;
  repository?: {
    url: string;
    branch: string;
    info?: RepositoryInfo;
  };
  settings: {
    autoStart: boolean;
    resources: 'small' | 'medium' | 'large';
    environment: Record<string, string>;
  };
}

interface WorkspaceCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WorkspaceCreationData) => Promise<void>;
  isLoading?: boolean;
}

const WORKSPACE_TEMPLATES: WorkspaceTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Environment',
    description: 'Start with a clean environment and build from scratch',
    icon: FileText,
    category: 'other',
    technologies: [],
    features: ['Clean slate', 'Maximum flexibility', 'Custom setup'],
    setupTime: '< 1 min'
  },
  {
    id: 'react-app',
    name: 'React Application',
    description: 'Modern React app with TypeScript, Vite, and Tailwind CSS',
    icon: Code,
    category: 'web',
    technologies: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
    features: ['Hot reload', 'TypeScript support', 'Modern tooling', 'Responsive design'],
    setupTime: '2-3 min'
  },
  {
    id: 'node-api',
    name: 'Node.js API',
    description: 'REST API with Express, TypeScript, and database integration',
    icon: Server,
    category: 'backend',
    technologies: ['Node.js', 'Express', 'TypeScript', 'PostgreSQL'],
    features: ['RESTful API', 'Authentication', 'Database ORM', 'API documentation'],
    setupTime: '3-4 min'
  },
  {
    id: 'fullstack',
    name: 'Full-stack Application',
    description: 'Complete web application with frontend and backend',
    icon: Globe,
    category: 'web',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
    features: ['Frontend + Backend', 'Database', 'Authentication', 'Deployment ready'],
    setupTime: '5-7 min'
  },
  {
    id: 'python-data',
    name: 'Python Data Science',
    description: 'Python environment for data analysis and machine learning',
    icon: Database,
    category: 'data',
    technologies: ['Python', 'Pandas', 'NumPy', 'Jupyter'],
    features: ['Data analysis', 'Jupyter notebooks', 'ML libraries', 'Visualization'],
    setupTime: '3-5 min'
  },
  {
    id: 'microservice',
    name: 'Microservice',
    description: 'Containerized microservice with Docker and CI/CD',
    icon: Package,
    category: 'backend',
    technologies: ['Docker', 'Kubernetes', 'CI/CD', 'Monitoring'],
    features: ['Containerized', 'Scalable', 'Production ready', 'Auto deployment'],
    setupTime: '4-6 min'
  }
];

const RESOURCE_OPTIONS = [
  { id: 'small', name: 'Small', description: '1 CPU, 2GB RAM', suitable: 'Personal projects, learning' },
  { id: 'medium', name: 'Medium', description: '2 CPU, 4GB RAM', suitable: 'Development, small teams' },
  { id: 'large', name: 'Large', description: '4 CPU, 8GB RAM', suitable: 'Production, large projects' }
];

export default function WorkspaceCreationWizard({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false 
}: WorkspaceCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [workspaceData, setWorkspaceData] = useState<WorkspaceCreationData>({
    name: '',
    description: '',
    template: null,
    repository: undefined,
    settings: {
      autoStart: true,
      resources: 'medium',
      environment: {}
    }
  });

  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [repositoryValidation, setRepositoryValidation] = useState<{
    status: 'idle' | 'validating' | 'valid' | 'invalid';
    message?: string;
    info?: RepositoryInfo;
  }>({ status: 'idle' });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setWorkspaceData({
        name: '',
        description: '',
        template: null,
        repository: undefined,
        settings: {
          autoStart: true,
          resources: 'medium',
          environment: {}
        }
      });
      setRepositoryUrl('');
      setRepositoryValidation({ status: 'idle' });
      setErrors({});
    }
  }, [isOpen]);

  const validateRepository = useCallback(async (url: string) => {
    if (!url.trim()) {
      setRepositoryValidation({ status: 'idle' });
      return;
    }

    // Basic URL validation
    const gitHubUrlRegex = /^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/;
    if (!gitHubUrlRegex.test(url.trim())) {
      setRepositoryValidation({ 
        status: 'invalid', 
        message: 'Please enter a valid GitHub repository URL' 
      });
      return;
    }

    setRepositoryValidation({ status: 'validating' });

    try {
      // Mock repository validation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock repository info
      const mockInfo: RepositoryInfo = {
        owner: 'example',
        name: 'repo',
        description: 'Example repository description',
        defaultBranch: 'main',
        branches: ['main', 'develop', 'feature/new-ui'],
        isPrivate: false,
        lastUpdated: new Date(),
        stars: 42,
        language: 'TypeScript'
      };

      setRepositoryValidation({ 
        status: 'valid', 
        message: 'Repository found and accessible',
        info: mockInfo
      });

      setWorkspaceData(prev => ({
        ...prev,
        repository: {
          url: url.trim(),
          branch: mockInfo.defaultBranch,
          info: mockInfo
        }
      }));
    } catch {
      setRepositoryValidation({ 
        status: 'invalid', 
        message: 'Repository not found or not accessible' 
      });
    }
  }, []);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!workspaceData.name.trim()) {
        newErrors.name = 'Workspace name is required';
      }
      if (!workspaceData.template) {
        newErrors.template = 'Please select a template';
      }
    }

    if (step === 2 && repositoryUrl.trim() && repositoryValidation.status === 'invalid') {
      newErrors.repository = repositoryValidation.message || 'Invalid repository';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (validateStep(3) && !isLoading) {
      await onSubmit(workspaceData);
    }
  };

  const updateWorkspaceData = (updates: Partial<WorkspaceCreationData>) => {
    setWorkspaceData(prev => ({ ...prev, ...updates }));
  };

  const handleRepositoryUrlChange = (url: string) => {
    setRepositoryUrl(url);
    if (url.trim()) {
      validateRepository(url);
    } else {
      setRepositoryValidation({ status: 'idle' });
      setWorkspaceData(prev => ({ ...prev, repository: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Create New Workspace</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              disabled={isLoading}
            >
              ✕
            </button>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center mt-4">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step === currentStep 
                    ? 'border-blue-500 bg-blue-500 text-white' 
                    : step < currentStep 
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-500 text-gray-400'
                }`}>
                  {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={`h-0.5 w-16 mx-2 ${
                    step < currentStep ? 'bg-green-500' : 'bg-gray-500'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          
          <div className="flex justify-between mt-2 text-sm">
            <span className={currentStep === 1 ? 'text-blue-400' : currentStep > 1 ? 'text-green-400' : 'text-gray-400'}>
              Template & Name
            </span>
            <span className={currentStep === 2 ? 'text-blue-400' : currentStep > 2 ? 'text-green-400' : 'text-gray-400'}>
              Repository (Optional)
            </span>
            <span className={currentStep === 3 ? 'text-blue-400' : 'text-gray-400'}>
              Configuration
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Template Selection and Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Choose a Template</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {WORKSPACE_TEMPLATES.map((template) => {
                    const Icon = template.icon;
                    const isSelected = workspaceData.template?.id === template.id;
                    
                    return (
                      <div
                        key={template.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-500/10' 
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => updateWorkspaceData({ template })}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            isSelected ? 'bg-blue-500/20' : 'bg-gray-700'
                          }`}>
                            <Icon className={`h-5 w-5 ${
                              isSelected ? 'text-blue-400' : 'text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{template.name}</h4>
                            <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {template.technologies.slice(0, 3).map((tech) => (
                                <span 
                                  key={tech}
                                  className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded"
                                >
                                  {tech}
                                </span>
                              ))}
                              {template.technologies.length > 3 && (
                                <span className="text-xs text-gray-400">
                                  +{template.technologies.length - 3} more
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Zap className="h-3 w-3 text-green-400" />
                              <span className="text-xs text-green-400">{template.setupTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {errors.template && (
                  <p className="text-red-400 text-sm mt-2">{errors.template}</p>
                )}
              </div>

              <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <h4 className="font-medium text-white mb-4">Workspace Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Workspace Name *
                    </label>
                    <input
                      type="text"
                      value={workspaceData.name}
                      onChange={(e) => updateWorkspaceData({ name: e.target.value })}
                      placeholder="My Awesome Project"
                      className={`w-full bg-gray-600 text-white rounded-lg px-3 py-2 border ${
                        errors.name ? 'border-red-500' : 'border-gray-500'
                      } focus:border-blue-500 focus:outline-none`}
                    />
                    {errors.name && (
                      <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={workspaceData.description}
                      onChange={(e) => updateWorkspaceData({ description: e.target.value })}
                      placeholder="Brief description of your project"
                      className="w-full bg-gray-600 text-white rounded-lg px-3 py-2 border border-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Repository Configuration */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Repository Setup</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Optionally connect a Git repository to your workspace. You can also add one later.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Repository URL (Optional)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={repositoryUrl}
                    onChange={(e) => handleRepositoryUrlChange(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className={`w-full bg-gray-700 text-white rounded-lg px-3 py-2 pr-10 border ${
                      errors.repository ? 'border-red-500' : 'border-gray-600'
                    } focus:border-blue-500 focus:outline-none`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {repositoryValidation.status === 'validating' && (
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                    )}
                    {repositoryValidation.status === 'valid' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {repositoryValidation.status === 'invalid' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                {repositoryValidation.message && (
                  <p className={`text-sm mt-1 ${
                    repositoryValidation.status === 'valid' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {repositoryValidation.message}
                  </p>
                )}
              </div>

              {/* Repository Info Display */}
              {repositoryValidation.status === 'valid' && repositoryValidation.info && (
                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white">
                        {repositoryValidation.info.owner}/{repositoryValidation.info.name}
                      </h4>
                      {repositoryValidation.info.description && (
                        <p className="text-sm text-gray-400 mt-1">
                          {repositoryValidation.info.description}
                        </p>
                      )}
                    </div>
                    <a 
                      href={repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Language:</span>
                      <span className="text-white ml-1">
                        {repositoryValidation.info.language || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Stars:</span>
                      <span className="text-white ml-1">
                        {repositoryValidation.info.stars || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Default branch:</span>
                      <span className="text-white ml-1">
                        {repositoryValidation.info.defaultBranch}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Visibility:</span>
                      <span className="text-white ml-1">
                        {repositoryValidation.info.isPrivate ? 'Private' : 'Public'}
                      </span>
                    </div>
                  </div>

                  {/* Branch Selection */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Branch to clone
                    </label>
                    <select
                      value={workspaceData.repository?.branch || repositoryValidation.info.defaultBranch}
                      onChange={(e) => updateWorkspaceData({
                        repository: {
                          ...workspaceData.repository!,
                          branch: e.target.value
                        }
                      })}
                      className="w-full bg-gray-600 text-white rounded-lg px-3 py-2 border border-gray-500 focus:border-blue-500 focus:outline-none"
                    >
                      {repositoryValidation.info.branches.map((branch) => (
                        <option key={branch} value={branch}>
                          {branch}
                          {branch === repositoryValidation.info?.defaultBranch && ' (default)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Configuration */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Workspace Configuration</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Configure resources and settings for your workspace.
                </p>
              </div>

              {/* Resource Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Resource Allocation
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {RESOURCE_OPTIONS.map((option) => (
                    <div
                      key={option.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        workspaceData.settings.resources === option.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => updateWorkspaceData({
                        settings: { 
                          ...workspaceData.settings, 
                          resources: option.id as 'small' | 'medium' | 'large'
                        }
                      })}
                    >
                      <h4 className="font-medium text-white">{option.name}</h4>
                      <p className="text-sm text-gray-400">{option.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{option.suitable}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-300">
                      Auto-start workspace
                    </label>
                    <p className="text-xs text-gray-400">
                      Start the workspace immediately after creation
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={workspaceData.settings.autoStart}
                      onChange={(e) => updateWorkspaceData({
                        settings: { ...workspaceData.settings, autoStart: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Workspace Preview */}
              <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <h4 className="font-medium text-white mb-3">Workspace Preview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white">{workspaceData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Template:</span>
                    <span className="text-white">{workspaceData.template?.name}</span>
                  </div>
                  {workspaceData.repository && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Repository:</span>
                        <span className="text-white flex items-center gap-1">
                          <GitBranch className="h-3 w-3" />
                          {workspaceData.repository.info?.name}:{workspaceData.repository.branch}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Resources:</span>
                    <span className="text-white capitalize">{workspaceData.settings.resources}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Auto-start:</span>
                    <span className="text-white">{workspaceData.settings.autoStart ? 'Yes' : 'No'}</span>
                  </div>
                  {workspaceData.template && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Setup time:</span>
                      <span className="text-green-400">{workspaceData.template.setupTime}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-700 px-6 py-4 border-t border-gray-600 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1 || isLoading}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Creating...
                  </>
                ) : (
                  'Create Workspace'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
