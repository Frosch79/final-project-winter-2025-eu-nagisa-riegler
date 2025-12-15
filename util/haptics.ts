import * as Haptics from 'expo-haptics';

export const tabPressHaptic = async () => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};
