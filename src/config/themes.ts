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
  // CSS custom properties for Tailwind (auto-generated from colors)
  cssVars: Record<string, string>
}

// Brand colors - exported for reuse throughout the app
export const BRAND_COLORS = {
  forestGreen: '#264a32',
  electricGreen: '#96f247',
  keyLime: '#d8ffb5',
  highlight: '#f0ffe3',
  charcoal: '#2a2a2a',
} as const

/**
 * Helper function to auto-generate CSS custom properties from color definitions
 * Converts camelCase keys to kebab-case CSS variable names
 * Example: textPrimary -> --color-text-primary
 */
function generateCssVars(colors: ThemeColors['colors']): Record<string, string> {
  const cssVars: Record<string, string> = {}

  for (const [key, value] of Object.entries(colors)) {
    if (value) {
      // Convert camelCase to kebab-case: textPrimary -> text-primary
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      cssVars[`--color-${kebabKey}`] = value
    }
  }

  return cssVars
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
      accent: BRAND_COLORS.electricGreen,
      border: '#3a4a3d',
    },
    get cssVars() {
      return generateCssVars(this.colors)
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
      border: '#4a5951', // lighter green-tinted gray for better visibility
    },
    get cssVars() {
      return generateCssVars(this.colors)
    },
  },
  slateLime: {
    name: 'Slate & Lime',
    description: 'Modern, high-contrast with charcoal foundation',
    colors: {
      background: BRAND_COLORS.charcoal,
      surface: '#333333',
      surfaceVariant: '#3d3d3d',
      textPrimary: '#ffffff',
      textSecondary: '#b8b8b8',
      accent: BRAND_COLORS.electricGreen,
      accentSecondary: BRAND_COLORS.keyLime,
      border: '#4a4a4a',
    },
    get cssVars() {
      return generateCssVars(this.colors)
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
      accent: BRAND_COLORS.electricGreen,
      border: '#96f24733', // electric-green at 20% opacity
    },
    get cssVars() {
      return generateCssVars(this.colors)
    },
  },
}

export type DarkThemeKey = keyof typeof darkThemes

export const lightThemes: Record<string, ThemeColors> = {
  springMeadow: {
    name: 'Spring Meadow',
    description: 'Fresh and airy with natural green tones',
    colors: {
      background: BRAND_COLORS.highlight,
      surface: '#ffffff',
      surfaceVariant: '#f5f5f5',
      textPrimary: '#1a1a1a',
      textSecondary: BRAND_COLORS.forestGreen,
      accent: BRAND_COLORS.forestGreen,
      accentSecondary: BRAND_COLORS.electricGreen,
      border: '#b8d99b', // darker than key-lime for better contrast
    },
    get cssVars() {
      return generateCssVars(this.colors)
    },
  },
  mintFresh: {
    name: 'Mint Fresh',
    description: 'Clean and minimal with subtle green accents',
    colors: {
      background: '#ffffff',
      surface: '#f9fdf9', // very light green tint
      surfaceVariant: BRAND_COLORS.highlight,
      textPrimary: '#1a1a1a',
      textSecondary: BRAND_COLORS.forestGreen,
      accent: '#52a01e', // darker green for WCAG AA compliance (4.5:1 on white)
      accentSecondary: BRAND_COLORS.forestGreen,
      border: '#c5d9c6', // darker green-tinted gray for better contrast
    },
    get cssVars() {
      return generateCssVars(this.colors)
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
      textSecondary: BRAND_COLORS.forestGreen,
      accent: '#52a01e', // darker accessible green (matches Mint Fresh)
      accentSecondary: BRAND_COLORS.forestGreen,
      border: '#b8e086', // darker key-lime for visibility
    },
    get cssVars() {
      return generateCssVars(this.colors)
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
      textSecondary: BRAND_COLORS.forestGreen,
      accent: BRAND_COLORS.forestGreen,
      accentSecondary: BRAND_COLORS.electricGreen,
      border: '#c8dcd0',
    },
    get cssVars() {
      return generateCssVars(this.colors)
    },
  },
}

export type LightThemeKey = keyof typeof lightThemes
