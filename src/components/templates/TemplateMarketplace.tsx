import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  Clock, 
  Code, 
  Database, 
  Globe, 
  Smartphone, 
  Cpu, 
  Brain,
  Gamepad2,
  Settings,
  ChevronDown,
  Heart,
  TrendingUp
} from 'lucide-react';
import type { WorkspaceTemplate, TemplateCategory, TemplateFilter } from '../../types/templates.js';

interface TemplateMarketplaceProps {
  onSelectTemplate: (template: WorkspaceTemplate) => void;
  onClose: () => void;
  className?: string;
}

// Mock template data - in production, this would come from an API
const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: 'web',
    name: 'Web Development',
    description: 'Frontend and full-stack web applications',
    icon: 'Globe',
    color: 'blue',
    templates: []
  },
  {
    id: 'backend',
    name: 'Backend & APIs',
    description: 'Server-side applications and APIs',
    icon: 'Database',
    color: 'green',
    templates: []
  },
  {
    id: 'data',
    name: 'Data Science',
    description: 'Analytics, ML, and data processing',
    icon: 'Brain',
    color: 'purple',
    templates: []
  },
  {
    id: 'mobile',
    name: 'Mobile Apps',
    description: 'iOS, Android, and cross-platform',
    icon: 'Smartphone',
    color: 'orange',
    templates: []
  },
  {
    id: 'devops',
    name: 'DevOps & Cloud',
    description: 'Infrastructure and deployment',
    icon: 'Settings',
    color: 'gray',
    templates: []
  },
  {
    id: 'ai',
    name: 'AI & ML',
    description: 'Artificial intelligence and machine learning',
    icon: 'Brain',
    color: 'indigo',
    templates: []
  },
  {
    id: 'game',
    name: 'Game Development',
    description: 'Game engines and interactive experiences',
    icon: 'Gamepad2',
    color: 'red',
    templates: []
  }
];

const SAMPLE_TEMPLATES: WorkspaceTemplate[] = [
  {
    id: 'react-ts-vite',
    name: 'React + TypeScript + Vite',
    description: 'Modern React application with TypeScript, Vite, Tailwind CSS, and testing setup',
    category: 'web',
    icon: '⚛️',
    tags: ['react', 'typescript', 'vite', 'tailwind', 'testing'],
    config: {
      languages: ['TypeScript', 'JavaScript'],
      frameworks: ['React', 'Vite'],
      tools: ['ESLint', 'Prettier', 'Vitest'],
      dependencies: {
        'react': '^18.2.0',
        'typescript': '^5.0.0',
        'vite': '^4.0.0',
        'tailwindcss': '^3.3.0'
      },
      ports: [3000, 3001],
      environment: {
        'NODE_ENV': 'development',
        'VITE_API_URL': 'http://localhost:3001'
      },
      scripts: {
        'dev': 'vite',
        'build': 'vite build',
        'test': 'vitest'
      }
    },
    resources: {
      cpu: 2,
      memory: 4096,
      storage: 10240
    },
    metadata: {
      author: 'OpenCode Team',
      version: '1.2.0',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-07-01'),
      downloads: 15420,
      rating: 4.8,
      difficulty: 'beginner',
      estimatedSetupTime: 3
    },
    setup: {
      steps: [
        {
          name: 'Initialize Project',
          description: 'Create Vite project with React and TypeScript',
          command: 'npm create vite@latest . -- --template react-ts'
        },
        {
          name: 'Install Dependencies',
          description: 'Install all required packages',
          command: 'npm install'
        },
        {
          name: 'Setup Tailwind CSS',
          description: 'Configure Tailwind CSS for styling',
          command: 'npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p'
        }
      ],
      postInstall: ['npm run dev']
    },
    documentation: {
      readme: '# React + TypeScript + Vite Template\n\nA modern React development setup...',
      quickStart: 'Run `npm run dev` to start the development server.',
      examples: [
        {
          name: 'Basic Component',
          description: 'Create a simple React component',
          code: 'export function HelloWorld() {\n  return <h1>Hello, World!</h1>;\n}'
        }
      ]
    }
  },
  // Add more sample templates...
];

export function TemplateMarketplace({ onSelectTemplate, onClose, className = '' }: TemplateMarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filter, setFilter] = useState<TemplateFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating'>('popular');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTemplates = useMemo(() => {
    let templates = SAMPLE_TEMPLATES;

    // Filter by category
    if (selectedCategory !== 'all') {
      templates = templates.filter(t => t.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply additional filters
    if (filter.difficulty) {
      templates = templates.filter(t => t.metadata.difficulty === filter.difficulty);
    }

    // Sort templates
    switch (sortBy) {
      case 'popular':
        templates.sort((a, b) => b.metadata.downloads - a.metadata.downloads);
        break;
      case 'newest':
        templates.sort((a, b) => b.metadata.updatedAt.getTime() - a.metadata.updatedAt.getTime());
        break;
      case 'rating':
        templates.sort((a, b) => b.metadata.rating - a.metadata.rating);
        break;
    }

    return templates;
  }, [selectedCategory, searchTerm, filter, sortBy]);

  const getCategoryIcon = (iconName: string) => {
    const icons = {
      Globe, Database, Brain, Smartphone, Settings, Gamepad2
    };
    const Icon = icons[iconName as keyof typeof icons] || Code;
    return Icon;
  };

  const renderTemplateCard = (template: WorkspaceTemplate) => (
    <div
      key={template.id}
      className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-all cursor-pointer group"
      onClick={() => onSelectTemplate(template)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{template.icon}</div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
              {template.name}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2 mt-1">
              {template.description}
            </p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-red-400 transition-colors">
          <Heart className="h-5 w-5" />
        </button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {template.tags.slice(0, 3).map(tag => (
          <span
            key={tag}
            className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-md"
          >
            {tag}
          </span>
        ))}
        {template.tags.length > 3 && (
          <span className="text-xs text-gray-500">
            +{template.tags.length - 3} more
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span>{template.metadata.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>{template.metadata.downloads.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{template.metadata.estimatedSetupTime}m</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Cpu className="h-4 w-4" />
          <span>{template.resources.cpu} CPU, {(template.resources.memory / 1024).toFixed(1)}GB RAM</span>
        </div>
      </div>

      {/* Difficulty badge */}
      <div className="mt-3 flex justify-between items-center">
        <span className={`
          text-xs px-2 py-1 rounded-full
          ${template.metadata.difficulty === 'beginner' ? 'bg-green-900 text-green-300' :
            template.metadata.difficulty === 'intermediate' ? 'bg-yellow-900 text-yellow-300' :
            'bg-red-900 text-red-300'
          }
        `}>
          {template.metadata.difficulty}
        </span>
        <span className="text-xs text-gray-500">
          v{template.metadata.version}
        </span>
      </div>
    </div>
  );

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${className}`}>
      <div className="bg-gray-900 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Template Marketplace</h2>
              <p className="text-gray-400 text-sm">Choose from our collection of pre-configured workspace templates</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Search and filters */}
          <div className="mt-4 flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="rating">Highest Rated</option>
              </select>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white hover:bg-gray-600 transition-colors"
              >
                <Filter className="h-4 w-4" />
                Filters
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-750 rounded-lg border border-gray-600">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                  <select
                    value={filter.difficulty || ''}
                    onChange={(e) => setFilter({...filter, difficulty: e.target.value || undefined})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                {/* Add more filter options as needed */}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex h-full max-h-[calc(90vh-200px)]">
          {/* Categories sidebar */}
          <div className="w-64 bg-gray-850 border-r border-gray-700 p-4 overflow-y-auto">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  selectedCategory === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>All Templates</span>
                <span className="ml-auto text-xs">{SAMPLE_TEMPLATES.length}</span>
              </button>
              
              {TEMPLATE_CATEGORIES.map(category => {
                const Icon = getCategoryIcon(category.icon);
                const count = SAMPLE_TEMPLATES.filter(t => t.category === category.id).length;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{category.name}</div>
                      <div className="text-xs opacity-75 truncate">{category.description}</div>
                    </div>
                    <span className="text-xs">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Templates grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-16">
                <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No templates found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTemplates.map(renderTemplateCard)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplateMarketplace;