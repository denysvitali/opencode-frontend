import { MessageCircle, Folder, Terminal, GitBranch } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore.js';
import type { ViewType } from '../../types/index.js';

const navigationItems: Array<{
  id: ViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'chat',
    label: 'Chat',
    icon: MessageCircle,
  },
  {
    id: 'filesystem',
    label: 'Files',
    icon: Folder,
  },
  {
    id: 'git-diff',
    label: 'Git Diff',
    icon: GitBranch,
  },
  {
    id: 'terminal',
    label: 'Terminal',
    icon: Terminal,
  },
];

export default function Navigation() {
  const { activeView, setActiveView } = useUIStore();

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="flex">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`
                flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all duration-200
                border-b-2 border-transparent hover:bg-gray-700/50
                ${isActive 
                  ? 'text-blue-400 border-blue-400 bg-gray-700/30' 
                  : 'text-gray-300 hover:text-white'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
