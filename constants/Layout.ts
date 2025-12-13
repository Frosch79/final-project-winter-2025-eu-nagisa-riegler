import { colors } from './Colors';
import { spacing } from './Spacing';

export const layout = {
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },

  sectionTitle: {
    marginVertical: spacing.sm,
    fontSize: 18,
    fontWeight: '500',
  },

  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};
