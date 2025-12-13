import { MD3DarkTheme as DefaultTheme } from 'react-native-paper';
import { colors } from './Colors';

export const theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,

    primary: colors.primary,
    primaryContainer: colors.primaryContainer,

    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,

    onBackground: colors.textPrimary,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,

    outline: colors.outline,
    error: colors.error,

    disabled: colors.disabled,
  },
};
