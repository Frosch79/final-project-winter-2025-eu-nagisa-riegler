import { colors } from './Colors';
import { spacing } from './Spacing';

export const components = {
  // TextInput
  input: {
    mode: 'outlined',
    outlineColor: colors.outline,
    activeOutlineColor: colors.primary,
    style: {
      borderRadius: 4,
      marginBottom: spacing.md,
    },
  },

  // Primary Button
  buttonPrimary: {
    mode: 'contained',
    style: {
      borderRadius: 4,
      paddingVertical: 8,
    },
    textColor: colors.white,
  },

  // Flat Button
  buttonFlat: {
    mode: 'text',
  },

  // Album / Photo Card
  card: {
    style: {
      borderRadius: 6,
      overflow: 'hidden',
      marginBottom: spacing.md,
    },
    image: {
      width: '100%',
      height: 180,
      borderRadius: 6,
    },
  },
  button: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
};
