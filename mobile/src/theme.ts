/**
 * SecureMemo Design Tokens
 * Centralized color palette, typography, and spacing constants
 * matching the HTML/Tailwind mockup designs.
 */

export const COLORS = {
  // Backgrounds
  vaultBlack: '#0a0a0f',
  vaultGlow: '#0d1021',
  surface: '#111827',

  // Primary accent
  vaultTeal: '#0d7377',
  vaultTealDark: '#0a5568',

  // Borders
  border: '#1e293b',
  borderLight: 'rgba(255,255,255,0.1)',

  // Text
  textLight: '#f0f4f8',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  footerText: '#475569',
  darkGray: '#374151',

  // Semantic
  amber: '#f59e0b',
  amberDark: '#92400e',
  amberBg: '#1a0e00',
  green: '#22c55e',
  red: '#ef4444',
  redDark: '#7f1d1d',

  // Overlays
  whiteAlpha5: 'rgba(255,255,255,0.05)',
  whiteAlpha10: 'rgba(255,255,255,0.1)',
  tealAlpha20: 'rgba(13,115,119,0.2)',
  tealAlpha40: 'rgba(13,115,119,0.4)',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const FONTS = {
  regular: { fontWeight: '400' as const },
  medium: { fontWeight: '500' as const },
  semibold: { fontWeight: '600' as const },
  bold: { fontWeight: '700' as const },
} as const;
