import { type TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  headline: {
    fontSize: 24,
    fontWeight: '600',
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
  },
  small: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
  },
  button: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
  },
};
