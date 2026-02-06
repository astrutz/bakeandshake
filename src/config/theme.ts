/**
 * Bake 'n Shake Color Theme
 * Centralized color configuration for consistent styling
 */

export const Theme = {
  // Primary Bakery Colors
  colors: {
    // Browns
    saddleBrown: '#8B4513',
    chocolate: '#D2691E',
    darkBrown: '#654321',

    // Warm Tones
    moccasin: '#FFE4B5',
    wheat: '#F5DEB3',
    peachPuff: '#FFDEAD',

    // Gold/Coins
    gold: '#FFD700',
    darkGold: '#FFA500',

    // UI Colors
    white: '#FFFFFF',
    black: '#000000',
    darkGray: '#1a1a1a',
    mediumGray: '#666666',
    lightGray: '#999999',

    // Accent Colors
    orange: '#FFA500',
    green: '#00ff00',
    red: '#ff0000',
    blue: '#646cff',
    darkBlue: '#535bf2',
  },

  // Transparency variants
  alpha: {
    overlay: 'rgba(0, 0, 0, 0.8)',
    overlayLight: 'rgba(0, 0, 0, 0.7)',
    overlayMedium: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.5)',
    shadowDark: 'rgba(0, 0, 0, 0.8)',

    brownBox: 'rgba(139, 69, 19, 0.85)',
    brownBoxSolid: 'rgba(139, 69, 19, 0.9)',

    grayDisabled: 'rgba(100, 100, 100, 0.5)',
  },

  // UI Component Styles
  ui: {
    borderWidth: {
      thin: 2,
      medium: 3,
      thick: 4,
    },

    padding: {
      small: 8,
      medium: 20,
      large: 40,
    },

    borderRadius: {
      small: 4,
      medium: 8,
      large: 16,
    },
  },

  // Fonts
  fonts: {
    body: 'Arial',
    monospace: '"Courier New", monospace',
    sizes: {
      tiny: '12px',
      small: '16px',
      medium: '20px',
      large: '24px',
      xlarge: '28px',
      huge: '64px',
      massive: '72px',
    },
  },
} as const;

// Export individual color palettes for convenience
export const Colors = Theme.colors;
export const Alpha = Theme.alpha;
export const UI = Theme.ui;
export const Fonts = Theme.fonts;