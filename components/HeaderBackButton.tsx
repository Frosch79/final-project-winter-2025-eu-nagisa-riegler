import { colors } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';

export default function HeaderBackButton() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        router.back();
      }}
      style={{ paddingHorizontal: 12 }}
    >
      <FontAwesome name="chevron-left" size={22} color={colors.textPrimary} />
    </Pressable>
  );
}
