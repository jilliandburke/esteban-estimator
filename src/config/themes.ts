export interface ThemeColors {
  name: string
  description: string
  colors: {
    background: string
    surface: string
    surfaceVariant: string
    textPrimary: string
    textSecondary: string
    accent: string
    accentSecondary?: string
    border: string
  }
  // CSS custom properties for Tailwind
  cssVars: Record<string, string>
}

export const darkThemes: Record<string, ThemeColors> = {
  deepForest: {
    name: 'Deep Forest',
    description: 'Natural extension of your green palette with earthy, organic tones',
    colors: {
      background: '#1a1f1c',
      surface: '#232b26',
      surfaceVariant: '#2d362f',
      textPrimary: '#e8f5eb',
      textSecondary: '#b8d4be',
      accent: '#96f247',
      border: '#3a4a3d',
    },
    cssVars: {
      '--color-background': '#1a1f1c',
      '--color-surface': '#232b26',
      '--color-surface-variant': '#2d362f',
      '--color-text-primary': '#e8f5eb',
      '--color-text-secondary': '#b8d4be',
      '--color-accent': '#96f247',
      '--color-border': '#3a4a3d',
    },
  },
  midnightSage: {
    name: 'Midnight Sage',
    description: 'Cooler, more professional with blue-green undertones',
    colors: {
      background: '#0f1410',
      surface: '#1c221d',
      surfaceVariant: '#283029',
      textPrimary: '#f0f7f1',
      textSecondary: '#c2d8c7',
      accent: '#e3ffca',
      border: '#3d4a40',
    },
    cssVars: {
      '--color-background': '#0f1410',
      '--color-surface': '#1c221d',
      '--color-surface-variant': '#283029',
      '--color-text-primary': '#f0f7f1',
      '--color-text-secondary': '#c2d8c7',
      '--color-accent': '#e3ffca',
      '--color-border': '#3d4a40',
    },
  },
  slateLime: {
    name: 'Slate & Lime',
    description: 'Modern, high-contrast with charcoal foundation',
    colors: {
      background: '#2a2a2a',
      surface: '#333333',
      surfaceVariant: '#3d3d3d',
      textPrimary: '#ffffff',
      textSecondary: '#b8b8b8',
      accent: '#96f247',
      accentSecondary: '#d8ffb5',
      border: '#4a4a4a',
    },
    cssVars: {
      '--color-background': '#2a2a2a',
      '--color-surface': '#333333',
      '--color-surface-variant': '#3d3d3d',
      '--color-text-primary': '#ffffff',
      '--color-text-secondary': '#b8b8b8',
      '--color-accent': '#96f247',
      '--color-accent-secondary': '#d8ffb5',
      '--color-border': '#4a4a4a',
    },
  },
  neonNoir: {
    name: 'Neon Noir',
    description: 'Bold, cyberpunk-inspired with glowing electric green',
    colors: {
      background: '#0d0d0d',
      surface: '#1a1a1a',
      surfaceVariant: '#242424',
      textPrimary: '#f5f5f5',
      textSecondary: '#a0a0a0',
      accent: '#96f247',
      border: '#96f24733', // electric-green at 20% opacity
    },
    cssVars: {
      '--color-background': '#0d0d0d',
      '--color-surface': '#1a1a1a',
      '--color-surface-variant': '#242424',
      '--color-text-primary': '#f5f5f5',
      '--color-text-secondary': '#a0a0a0',
      '--color-accent': '#96f247',
      '--color-border': '#96f24733',
    },
  },
}

export type DarkThemeKey = keyof typeof darkThemes

export const lightThemes: Record<string, ThemeColors> = {
  springMeadow: {
    name: 'Spring Meadow',
    description: 'Fresh and airy with natural green tones',
    colors: {
      background: '#f0ffe3', // highlight color
      surface: '#ffffff',
      surfaceVariant: '#f5f5f5',
      textPrimary: '#1a1a1a',
      textSecondary: '#264a32', // forest-green for secondary text
      accent: '#264a32', // forest-green as accent
      accentSecondary: '#96f247', // electric-green
      border: '#d8ffb5', // key-lime
    },
    cssVars: {
      '--color-background': '#f0ffe3',
      '--color-surface': '#ffffff',
      '--color-surface-variant': '#f5f5f5',
      '--color-text-primary': '#1a1a1a',
      '--color-text-secondary': '#264a32',
      '--color-accent': '#264a32',
      '--color-accent-secondary': '#96f247',
      '--color-border': '#d8ffb5',
    },
  },
  mintFresh: {
    name: 'Mint Fresh',
    description: 'Clean and minimal with subtle green accents',
    colors: {
      background: '#ffffff',
      surface: '#f9fdf9', // very light green tint
      surfaceVariant: '#f0ffe3', // highlight
      textPrimary: '#1a1a1a',
      textSecondary: '#264a32', // forest-green for better contrast
      accent: '#52a01e', // darker green for WCAG AA compliance (4.5:1 on white)
      accentSecondary: '#264a32', // forest-green instead of key-lime
      border: '#e0e8e0',
    },
    cssVars: {
      '--color-background': '#ffffff',
      '--color-surface': '#f9fdf9',
      '--color-surface-variant': '#f0ffe3',
      '--color-text-primary': '#1a1a1a',
      '--color-text-secondary': '#264a32',
      '--color-accent': '#52a01e',
      '--color-accent-secondary': '#264a32',
      '--color-border': '#e0e8e0',
    },
  },
  limelight: {
    name: 'Limelight',
    description: 'Bright and energetic with vibrant green highlights',
    colors: {
      background: '#ffffff', // pure white for better base contrast
      surface: '#f5fef0', // very subtle green tint
      surfaceVariant: '#e8f7dd', // lighter key-lime variant
      textPrimary: '#1a1a1a',
      textSecondary: '#264a32', // forest-green
      accent: '#52a01e', // darker accessible green (matches Mint Fresh)
      accentSecondary: '#264a32', // forest-green
      border: '#b8e086', // darker key-lime for visibility
    },
    cssVars: {
      '--color-background': '#ffffff',
      '--color-surface': '#f5fef0',
      '--color-surface-variant': '#e8f7dd',
      '--color-text-primary': '#1a1a1a',
      '--color-text-secondary': '#264a32',
      '--color-accent': '#52a01e',
      '--color-accent-secondary': '#264a32',
      '--color-border': '#b8e086',
    },
  },
  forestLight: {
    name: 'Forest Light',
    description: 'Earthy and grounded with deep green undertones',
    colors: {
      background: '#f8faf9',
      surface: '#ffffff',
      surfaceVariant: '#edf5f0',
      textPrimary: '#1a2a1f',
      textSecondary: '#264a32', // forest-green
      accent: '#264a32', // forest-green as primary
      accentSecondary: '#96f247', // electric-green for highlights
      border: '#c8dcd0',
    },
    cssVars: {
      '--color-background': '#f8faf9',
      '--color-surface': '#ffffff',
      '--color-surface-variant': '#edf5f0',
      '--color-text-primary': '#1a2a1f',
      '--color-text-secondary': '#264a32',
      '--color-accent': '#264a32',
      '--color-accent-secondary': '#96f247',
      '--color-border': '#c8dcd0',
    },
  },
}

export type LightThemeKey = keyof typeof lightThemes
