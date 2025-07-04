import { generateAvatarProps } from '../../utils/avatarGenerator.js';

interface WorkspaceAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showIcon?: boolean;
}

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64
};

export function WorkspaceAvatar({ 
  name, 
  size = 'md', 
  className = '',
  showIcon = false 
}: WorkspaceAvatarProps) {
  const avatarSize = sizeMap[size];
  const { gradient, initials, icon } = generateAvatarProps(name);
  
  return (
    <div
      className={`
        flex items-center justify-center
        rounded-full flex-shrink-0
        text-white font-bold
        shadow-lg
        ${className}
      `}
      style={{
        width: avatarSize,
        height: avatarSize,
        background: gradient,
        fontSize: avatarSize * 0.35,
      }}
      title={name}
    >
      {showIcon ? (
        <span style={{ fontSize: avatarSize * 0.5 }}>
          {icon}
        </span>
      ) : (
        initials
      )}
    </div>
  );
}

export default WorkspaceAvatar;