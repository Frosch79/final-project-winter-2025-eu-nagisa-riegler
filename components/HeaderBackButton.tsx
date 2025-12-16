import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { colors } from '../constants/Colors';

export default function HeaderBackButton() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => {
        router.back();
      }}
      style={{ paddingHorizontal: 12 }}
    >
      <FontAwesome name="chevron-left" size={22} color={colors.textPrimary} />
    </Pressable>
  );
}
