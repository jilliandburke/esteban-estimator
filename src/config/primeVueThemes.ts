import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import { darkThemes, lightThemes, type DarkThemeKey, type LightThemeKey } from './themes'

// Helper function to convert hex to rgb
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove alpha channel if present
  const cleanHex = hex.replace(/[^0-9A-F]/gi, '').substring(0, 6)
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

// Create a dynamic preset for a specific dark theme variant
export function createDarkThemePreset(themeKey: DarkThemeKey) {
  const theme = darkThemes[themeKey]
  const colors = theme.colors

  // Convert accent color to RGB for various alpha variations
  const accentRgb = hexToRgb(colors.accent)
  const accentRgbStr = accentRgb ? `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}` : '150, 242, 71'

  return definePreset(Aura, {
    semantic: {
      colorScheme: {
        dark: {
          // Root background - the main page background
          root: {
            background: colors.background,
            color: colors.textPrimary,
          },

          // Surface tokens - backgrounds and layers
          surface: {
            0: '#ffffff',
            50: colors.surfaceVariant,
            100: colors.surfaceVariant,
            200: colors.surfaceVariant,
            300: colors.surface,
            400: colors.surface,
            500: colors.surface,
            600: colors.background,
            700: colors.background,
            800: colors.background,
            900: colors.background,
            950: colors.background,
          },

          // Primary color (using accent)
          primary: {
            color: colors.accent,
            contrastColor: colors.background,
            hoverColor: colors.accent,
            activeColor: colors.accent,
          },

          // Text colors
          text: {
            color: colors.textPrimary,
            hoverColor: colors.textPrimary,
            mutedColor: colors.textSecondary,
            hoverMutedColor: colors.textSecondary,
          },

          // Content (used for borders, dividers, etc)
          content: {
            background: colors.surface,
            hoverBackground: colors.surfaceVariant,
            borderColor: colors.border,
            color: colors.textPrimary,
            hoverColor: colors.textPrimary,
          },

          // Overlay (dialogs, modals, etc)
          overlay: {
            select: {
              background: colors.surface,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
            popover: {
              background: colors.surface,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
            modal: {
              background: colors.surface,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
          },

          // Highlight (for selected items, focused states)
          highlight: {
            background: `rgba(${accentRgbStr}, 0.16)`,
            focusBackground: `rgba(${accentRgbStr}, 0.24)`,
            color: colors.accent,
            focusColor: colors.accent,
          },

          // Navigation
          navigation: {
            item: {
              focusBackground: colors.surfaceVariant,
              activeBackground: colors.surfaceVariant,
              color: colors.textPrimary,
              focusColor: colors.textPrimary,
              activeColor: colors.accent,
              icon: {
                color: colors.textSecondary,
                focusColor: colors.textPrimary,
                activeColor: colors.accent,
              },
            },
          },

          // Form fields
          formField: {
            background: colors.surface,
            disabledBackground: colors.surface,
            filledBackground: colors.surfaceVariant,
            filledFocusBackground: colors.surfaceVariant,
            borderColor: colors.border,
            hoverBorderColor: colors.accent,
            focusBorderColor: colors.accent,
            invalidBorderColor: '#f87171',
            color: colors.textPrimary,
            disabledColor: colors.textSecondary,
            placeholderColor: colors.textSecondary,
            floatLabelColor: colors.textSecondary,
            floatLabelFocusColor: colors.accent,
            floatLabelInvalidColor: '#f87171',
            iconColor: colors.textSecondary,
          },

          // Mask (for overlays, modals)
          mask: {
            background: 'rgba(0, 0, 0, 0.4)',
            color: colors.textPrimary,
          },
        },
      },
    },

    components: {
      // Button customizations
      button: {
        colorScheme: {
          dark: {
            root: {
              primary: {
                background: colors.accent,
                hoverBackground: colors.accent,
                activeBackground: colors.accent,
                borderColor: colors.accent,
                hoverBorderColor: colors.accent,
                activeBorderColor: colors.accent,
                color: colors.background,
                hoverColor: colors.background,
                activeColor: colors.background,
              },
              secondary: {
                background: colors.surface,
                hoverBackground: colors.surfaceVariant,
                activeBackground: colors.surfaceVariant,
                borderColor: colors.border,
                hoverBorderColor: colors.border,
                activeBorderColor: colors.border,
                color: colors.textPrimary,
                hoverColor: colors.textPrimary,
                activeColor: colors.textPrimary,
              },
              success: {
                background: colors.accent,
                hoverBackground: colors.accent,
                activeBackground: colors.accent,
                borderColor: colors.accent,
                hoverBorderColor: colors.accent,
                activeBorderColor: colors.accent,
                color: colors.background,
                hoverColor: colors.background,
                activeColor: colors.background,
              },
            },
          },
        },
      },

      // Card customizations
      card: {
        colorScheme: {
          dark: {
            root: {
              background: colors.surface,
              color: colors.textPrimary,
            },
            subtitle: {
              color: colors.textSecondary,
            },
          },
        },
      },

      // DataTable customizations
      datatable: {
        colorScheme: {
          dark: {
            root: {
              borderColor: colors.border,
            },
            header: {
              background: colors.surface,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
            headerCell: {
              background: colors.surface,
              hoverBackground: colors.surfaceVariant,
              selectedBackground: colors.surfaceVariant,
              borderColor: colors.border,
              color: colors.textPrimary,
              hoverColor: colors.textPrimary,
              selectedColor: colors.accent,
            },
            row: {
              background: colors.surface,
              hoverBackground: colors.surfaceVariant,
              selectedBackground: `rgba(${accentRgbStr}, 0.16)`,
              color: colors.textPrimary,
              hoverColor: colors.textPrimary,
              selectedColor: colors.textPrimary,
            },
            bodyCell: {
              borderColor: colors.border,
            },
          },
        },
      },

      // Dialog customizations
      dialog: {
        colorScheme: {
          dark: {
            root: {
              background: colors.surface,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
          },
        },
      },

      // Panel customizations
      panel: {
        colorScheme: {
          dark: {
            root: {
              background: colors.surface,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
          },
        },
      },

      // Tooltip customizations
      tooltip: {
        colorScheme: {
          dark: {
            root: {
              background: colors.surface,
              color: colors.textPrimary,
            },
          },
        },
      },
    },

    // Add global CSS to apply background color
    css: `
      html,
      body {
        background-color: ${colors.background} !important;
        color: ${colors.textPrimary} !important;
      }
    `,
  })
}

// Export pre-built presets for each dark theme
export const deepForestPreset = createDarkThemePreset('deepForest')
export const midnightSagePreset = createDarkThemePreset('midnightSage')
export const slateLimePreset = createDarkThemePreset('slateLime')
export const neonNoirPreset = createDarkThemePreset('neonNoir')

// Map dark theme keys to their presets
export const darkThemePresets: Record<DarkThemeKey, ReturnType<typeof definePreset>> = {
  deepForest: deepForestPreset,
  midnightSage: midnightSagePreset,
  slateLime: slateLimePreset,
  neonNoir: neonNoirPreset,
}

// Create a dynamic preset for a specific light theme variant
export function createLightThemePreset(themeKey: LightThemeKey) {
  const theme = lightThemes[themeKey]
  const colors = theme.colors

  // Convert accent color to RGB for various alpha variations
  const accentRgb = hexToRgb(colors.accent)
  const accentRgbStr = accentRgb ? `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}` : '38, 74, 50'

  return definePreset(Aura, {
    semantic: {
      colorScheme: {
        light: {
          // Root background - the main page background
          root: {
            background: colors.background,
            color: colors.textPrimary,
          },

          // Surface tokens - backgrounds and layers
          surface: {
            0: colors.surface,
            50: colors.surface,
            100: colors.surfaceVariant,
            200: colors.surfaceVariant,
            300: colors.surfaceVariant,
            400: colors.surface,
            500: colors.surface,
            600: colors.background,
            700: colors.background,
            800: colors.textSecondary,
            900: colors.textPrimary,
            950: colors.textPrimary,
          },

          // Primary color (using accent)
          primary: {
            color: colors.accent,
            contrastColor: '#ffffff',
            hoverColor: colors.accent,
            activeColor: colors.accent,
          },

          // Text colors
          text: {
            color: colors.textPrimary,
            hoverColor: colors.textPrimary,
            mutedColor: colors.textSecondary,
            hoverMutedColor: colors.textSecondary,
          },

          // Content (used for borders, dividers, etc)
          content: {
            background: colors.surface,
            hoverBackground: colors.surfaceVariant,
            borderColor: colors.border,
            color: colors.textPrimary,
            hoverColor: colors.textPrimary,
          },

          // Overlay (dialogs, modals, etc)
          overlay: {
            select: {
              background: colors.surface,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
            popover: {
              background: colors.surface,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
            modal: {
              background: colors.surface,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
          },

          // Highlight (for selected items, focused states)
          highlight: {
            background: `rgba(${accentRgbStr}, 0.1)`,
            focusBackground: `rgba(${accentRgbStr}, 0.16)`,
            color: colors.accent,
            focusColor: colors.accent,
          },

          // Navigation
          navigation: {
            item: {
              focusBackground: colors.surfaceVariant,
              activeBackground: colors.surfaceVariant,
              color: colors.textPrimary,
              focusColor: colors.textPrimary,
              activeColor: colors.accent,
              icon: {
                color: colors.textSecondary,
                focusColor: colors.textPrimary,
                activeColor: colors.accent,
              },
            },
          },

          // Form fields
          formField: {
            background: colors.surface,
            disabledBackground: colors.surfaceVariant,
            filledBackground: colors.surfaceVariant,
            filledFocusBackground: colors.surface,
            borderColor: colors.border,
            hoverBorderColor: colors.accent,
            focusBorderColor: colors.accent,
            invalidBorderColor: '#dc2626',
            color: colors.textPrimary,
            disabledColor: colors.textSecondary,
            placeholderColor: colors.textSecondary,
            floatLabelColor: colors.textSecondary,
            floatLabelFocusColor: colors.accent,
            floatLabelInvalidColor: '#dc2626',
            iconColor: colors.textSecondary,
          },

          // Mask (for overlays, modals)
          mask: {
            background: 'rgba(0, 0, 0, 0.4)',
            color: colors.textPrimary,
          },
        },
      },
    },

    components: {
      // Button customizations
      button: {
        colorScheme: {
          light: {
            root: {
              primary: {
                background: colors.accent,
                hoverBackground: colors.accent,
                activeBackground: colors.accent,
                borderColor: colors.accent,
                hoverBorderColor: colors.accent,
                activeBorderColor: colors.accent,
                color: '#ffffff',
                hoverColor: '#ffffff',
                activeColor: '#ffffff',
              },
              secondary: {
                background: colors.surface,
                hoverBackground: colors.surfaceVariant,
                activeBackground: colors.surfaceVariant,
                borderColor: colors.border,
                hoverBorderColor: colors.border,
                activeBorderColor: colors.border,
                color: colors.textPrimary,
                hoverColor: colors.textPrimary,
                activeColor: colors.textPrimary,
              },
              success: {
                background: colors.accent,
                hoverBackground: colors.accent,
                activeBackground: colors.accent,
                borderColor: colors.accent,
                hoverBorderColor: colors.accent,
                activeBorderColor: colors.accent,
                color: '#ffffff',
                hoverColor: '#ffffff',
                activeColor: '#ffffff',
              },
            },
          },
        },
      },

      // Card customizations
      card: {
        colorScheme: {
          light: {
            root: {
              background: colors.surface,
              color: colors.textPrimary,
            },
            subtitle: {
              color: colors.textSecondary,
            },
          },
        },
      },

      // DataTable customizations
      datatable: {
        colorScheme: {
          light: {
            root: {
              borderColor: colors.border,
            },
            header: {
              background: colors.surface,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
            headerCell: {
              background: colors.surface,
              hoverBackground: colors.surfaceVariant,
              selectedBackground: colors.surfaceVariant,
              borderColor: colors.border,
              color: colors.textPrimary,
              hoverColor: colors.textPrimary,
              selectedColor: colors.accent,
            },
            row: {
              background: colors.surface,
              hoverBackground: colors.surfaceVariant,
              selectedBackground: `rgba(${accentRgbStr}, 0.1)`,
              color: colors.textPrimary,
              hoverColor: colors.textPrimary,
              selectedColor: colors.textPrimary,
            },
            bodyCell: {
              borderColor: colors.border,
            },
          },
        },
      },

      // Dialog customizations
      dialog: {
        colorScheme: {
          light: {
            root: {
              background: colors.surface,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
          },
        },
      },

      // Panel customizations
      panel: {
        colorScheme: {
          light: {
            root: {
              background: colors.surface,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
          },
        },
      },

      // Tooltip customizations
      tooltip: {
        colorScheme: {
          light: {
            root: {
              background: colors.surfaceVariant,
              color: colors.textPrimary,
            },
          },
        },
      },
    },

    // Add global CSS to apply background color
    css: `
      html,
      body {
        background-color: ${colors.background} !important;
        color: ${colors.textPrimary} !important;
      }
    `,
  })
}

// Export pre-built presets for each light theme
export const springMeadowPreset = createLightThemePreset('springMeadow')
export const mintFreshPreset = createLightThemePreset('mintFresh')
export const limelightPreset = createLightThemePreset('limelight')
export const forestLightPreset = createLightThemePreset('forestLight')

// Map light theme keys to their presets
export const lightThemePresets: Record<LightThemeKey, ReturnType<typeof definePreset>> = {
  springMeadow: springMeadowPreset,
  mintFresh: mintFreshPreset,
  limelight: limelightPreset,
  forestLight: forestLightPreset,
}
