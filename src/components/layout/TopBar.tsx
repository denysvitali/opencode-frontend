import { useNavigate } from 'react-router-dom';
import UserProfile from '../ui/UserProfile.js';

export default function TopBar() {
  const navigate = useNavigate();
  return (
    <div className="bg-surface-primary/50 backdrop-blur-xl border-b border-border-primary relative z-[100] safe-area-top">
      <div className="px-4 md:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo/Brand */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity duration-200"
          >
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center bg-blue-600">
              <span className="text-white font-bold text-base md:text-lg">⌬</span>
            </div>
            <span className="text-text-primary font-semibold text-base md:text-lg">OpenCode</span>
          </button>

          {/* Right: User Profile */}
          <UserProfile variant="compact" showDropdown={true} />
        </div>
      </div>
    </div>
  );
}
