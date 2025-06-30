import { useState } from 'react';
import { Settings, LogOut, ChevronDown, Crown } from 'lucide-react';

// TODO: Replace with real user data from authentication
const mockUser = {
  id: 'user-1',
  name: 'Sophia Getz',
  email: 'sophia.getz@example.com',
  avatar: 'https://tabler.io/_next/image?url=%2Favatars%2Fdefault%2Fd1499909450ba526d5297e3ebc7f6d07.png&w=280&q=75',
  role: 'Senior Software Engineer',
  plan: 'Pro',
  workspaces: 12,
  totalSessions: 156
};

interface UserProfileProps {
  variant?: 'compact' | 'full';
  showDropdown?: boolean;
}

export default function UserProfile({ variant = 'compact', showDropdown = true }: UserProfileProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = () => {
    // TODO: Implement real sign out
    console.log('Signing out...');
    setIsDropdownOpen(false);
  };

  const handleSettings = () => {
    // TODO: Implement settings navigation
    console.log('Opening settings...');
    setIsDropdownOpen(false);
  };

  if (variant === 'compact') {
    return (
      <div className="relative z-50">
        <button
          onClick={() => showDropdown && setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-all duration-200 group"
        >
          {/* Avatar */}
          <div>
            {mockUser.avatar ? (
              <img
                src={mockUser.avatar}
                alt={mockUser.name}
                className="w-8 h-8 rounded-full border-2 border-blue-500/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg" style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
              }}>
                {getInitials(mockUser.name)}
              </div>
            )}
          </div>

          {/* Name & Chevron */}
          <div className="flex items-center gap-1">
            <span className="text-white text-sm font-medium">{mockUser.name.split(' ')[0]}</span>
            {showDropdown && (
              <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`} />
            )}
          </div>
        </button>

        {/* Dropdown Menu */}
        {showDropdown && isDropdownOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setIsDropdownOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute top-full right-0 mt-2 w-80 bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 z-[9999]">
              {/* Arrow pointing up to user avatar */}
              <div className="absolute -top-2 right-6">
                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-l-transparent border-r-transparent border-b-gray-700"></div>
              </div>
              <div className="overflow-hidden rounded-xl">
                {/* User Info Header */}
              <div className="p-4 border-b border-white/10" style={{
                background: 'linear-gradient(90deg, rgba(37, 99, 235, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)'
              }}>
                <div className="flex items-center gap-3">
                  <div>
                    {mockUser.avatar ? (
                      <img
                        src={mockUser.avatar}
                        alt={mockUser.name}
                        className="w-16 h-16 rounded-full border-2 border-blue-500/30"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold shadow-lg" style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                      }}>
                        {getInitials(mockUser.name)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold truncate">{mockUser.name}</h3>
                      {mockUser.plan === 'Pro' && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 rounded-full">
                          <Crown className="h-3 w-3 text-yellow-400" />
                          <span className="text-yellow-400 text-xs font-medium">Pro</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm">{mockUser.role}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="p-4 border-b border-white/10">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-white">{mockUser.workspaces}</div>
                    <div className="text-xs text-gray-400">Workspaces</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{mockUser.totalSessions}</div>
                    <div className="text-xs text-gray-400">Sessions</div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={handleSettings}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Account Settings</span>
                </button>
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Full variant for dashboard/settings pages
  return (
    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
      {/* Avatar */}
      <div className="relative">
        {mockUser.avatar ? (
          <img
            src={mockUser.avatar}
            alt={mockUser.name}
            className="w-16 h-16 rounded-full border-2 border-blue-500/30"
          />
        ) : (
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold shadow-lg" style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
          }}>
            {getInitials(mockUser.name)}
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900"></div>
      </div>

      {/* User Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold text-white">{mockUser.name}</h2>
          {mockUser.plan === 'Pro' && (
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-full">
              <Crown className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">Pro Plan</span>
            </div>
          )}
        </div>
        <p className="text-gray-400 mb-1">{mockUser.email}</p>
        <p className="text-gray-500 text-sm">{mockUser.role}</p>
      </div>

      {/* Quick Stats */}
      <div className="text-right">
        <div className="text-2xl font-bold text-white">{mockUser.workspaces}</div>
        <div className="text-sm text-gray-400">Active Workspaces</div>
      </div>
    </div>
  );
}
