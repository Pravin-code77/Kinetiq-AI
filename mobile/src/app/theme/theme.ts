export const COLORS = {
  // Backgrounds
  backgroundPrimary: '#101713',
  backgroundSecondary: '#18251F',
  cardBackground: '#202D25',
  cardHover: '#28392F',

  // Accents
  accentPrimary: '#B7F36B',   // Neon Lime
  accentSecondary: '#7FD6A5', // Mint Green
  accentGold: '#F3D36B',      // Badges / Streaks

  // Text
  textPrimary: '#F4F7F2',
  textSecondary: '#9BA99F',
  textMuted: '#68776D',
  textInverse: '#101713',

  // Borders & Dividers
  border: '#344238',
  borderLight: '#415446',
  borderNeon: '#B7F36B44',

  // Status
  error: '#FF6B6B',
  errorBackground: '#3A1E1E',
  success: '#A5E887',
  successBackground: '#1E3523',
  warning: '#FFB84D',
  info: '#6BC4FF',

  // Overlays
  overlay: 'rgba(16, 23, 19, 0.85)',
  glass: 'rgba(32, 45, 37, 0.75)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  card: 18,
  cardLg: 22,
  full: 9999,
};

export const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: COLORS.textPrimary },
  h2: { fontSize: 22, fontWeight: '700' as const, color: COLORS.textPrimary },
  h3: { fontSize: 18, fontWeight: '600' as const, color: COLORS.textPrimary },
  bodyLarge: { fontSize: 16, fontWeight: '400' as const, color: COLORS.textPrimary },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const, color: COLORS.textSecondary },
  bodySmall: { fontSize: 12, fontWeight: '400' as const, color: COLORS.textMuted },
  caption: { fontSize: 11, fontWeight: '500' as const, color: COLORS.textMuted },
  button: { fontSize: 15, fontWeight: '600' as const, color: COLORS.textInverse },
};
