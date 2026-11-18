import { Platform } from 'react-native';

/**
 * Identidad visual de Educa360.
 * Morado institucional + ámbar del logo, fondos claros y tarjetas blancas.
 */
export const colors = {
  primary: '#5F348F',
  primaryDark: '#46236B',
  primarySoft: '#F3E8FF',
  primaryMuted: '#8C4ABD',
  accent: '#F9B201',
  accentSoft: '#FFF6DF',
  gradient: ['#8C4ABD', '#F9B201'],

  bg: '#F7F8FC',
  surface: '#FFFFFF',
  surfaceAlt: '#F8FAFC',

  text: '#1E1B4B',
  textSoft: '#475569',
  muted: '#64748B',
  faint: '#94A3B8',
  line: '#E2E8F0',
  lineSoft: '#F1F5F9',

  success: '#10B981',
  successSoft: '#ECFDF5',
  successText: '#047857',
  warning: '#F59E0B',
  warningSoft: '#FFFBEB',
  warningText: '#B45309',
  info: '#4F46E5',
  infoSoft: '#EEF2FF',
  infoText: '#4338CA',
  danger: '#EF4444',
  dangerSoft: '#FEF2F2',
  dangerText: '#B91C1C',
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 999,
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const shadow = Platform.select({
  ios: {
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
  },
  android: { elevation: 3 },
  default: {},
});

export const shadowSoft = Platform.select({
  ios: {
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  android: { elevation: 1 },
  default: {},
});

/** Colores por estado de asistencia (solo asistencia, no notas). */
export const asistenciaTone = {
  PRESENTE: { bg: colors.successSoft, text: colors.successText, label: 'Presente' },
  TARDANZA: { bg: colors.warningSoft, text: colors.warningText, label: 'Tardanza' },
  JUSTIFICADA: { bg: colors.infoSoft, text: colors.infoText, label: 'Justificada' },
  FALTA: { bg: colors.dangerSoft, text: colors.dangerText, label: 'Falta' },
};
