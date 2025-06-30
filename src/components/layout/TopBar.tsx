import { useNavigate } from 'react-router-dom';
import UserProfile from '../ui/UserProfile.js';

export default function TopBar() {
  const navigate = useNavigate();
  return (
    <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 relative z-[100]">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo/Brand */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black">
              <span className="text-white font-bold text-lg">⌬</span>
            </div>
            <span className="text-white font-semibold text-lg">OpenCode</span>
          </button>

          {/* Right: User Profile */}
          <UserProfile variant="compact" showDropdown={true} />
        </div>
      </div>
    </div>
  );
}