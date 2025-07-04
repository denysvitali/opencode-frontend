// Utility for generating beautiful workspace avatars

// Beautiful gradient combinations
const gradients = [
  ['#667eea', '#764ba2'], // Purple Blue
  ['#f093fb', '#f5576c'], // Pink Red
  ['#4facfe', '#00f2fe'], // Blue Cyan
  ['#43e97b', '#38f9d7'], // Green Cyan
  ['#fa709a', '#fee140'], // Pink Yellow
  ['#a8edea', '#fed6e3'], // Cyan Pink
  ['#ff9a9e', '#fecfef'], // Pink Light
  ['#a18cd1', '#fbc2eb'], // Purple Pink
  ['#fad0c4', '#ffd1ff'], // Peach Pink
  ['#ffecd2', '#fcb69f'], // Orange Peach
  ['#ff8a80', '#ff80ab'], // Red Pink
  ['#8fd3f4', '#84fab0'], // Blue Green
  ['#c2e9fb', '#a1c4fd'], // Light Blue
  ['#fbc2eb', '#a6c1ee'], // Pink Blue
  ['#fdbb2d', '#22c1c3'], // Yellow Cyan
];

// Tech-inspired icons using Unicode characters
const icons = [
  '⚡', '🚀', '💡', '🔧', '⚙️', '💻', '🛠️', '📱', 
  '🎯', '🌟', '🔥', '💎', '🎨', '🧪', '🔬', '📊',
  '🎭', '🎪', '🎨', '🎬', '🎮', '🎲', '🎯', '🎪'
];

/**
 * Generate a deterministic color index based on string hash
 */
function hashStringToIndex(str: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % max;
}

/**
 * Generate workspace avatar props
 */
export function generateAvatarProps(name: string) {
  const gradientIndex = hashStringToIndex(name, gradients.length);
  const iconIndex = hashStringToIndex(name + 'icon', icons.length);
  
  const [color1, color2] = gradients[gradientIndex];
  const icon = icons[iconIndex];
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return {
    gradient: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
    icon,
    initials,
    color1,
    color2
  };
}

/**
 * Get consistent workspace color for UI elements
 */
export function getWorkspaceColor(name: string): string {
  const gradientIndex = hashStringToIndex(name, gradients.length);
  return gradients[gradientIndex][0];
}

/**
 * Generate a workspace avatar component props
 */
export function getAvatarStyle(name: string, size: number = 40) {
  const { gradient, initials, icon } = generateAvatarProps(name);
  
  return {
    style: {
      width: size,
      height: size,
      background: gradient,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: size * 0.4,
      fontWeight: 'bold',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    },
    content: initials,
    icon
  };
}

/**
 * Get workspace theme colors for UI consistency
 */
export function getWorkspaceTheme(name: string) {
  const { color1, color2 } = generateAvatarProps(name);
  
  return {
    primary: color1,
    secondary: color2,
    light: `${color1}20`, // 20% opacity
    border: `${color1}30`, // 30% opacity
    text: color1,
  };
}