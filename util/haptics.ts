import * as Haptics from 'expo-haptics';

export const tabPressHaptic = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};
