import { useRouter } from 'expo-router';
import { FlatList, View } from 'react-native';
import { Button, Modal, Text } from 'react-native-paper';
import { colors } from '../constants/Colors';
import { spacing } from '../constants/Spacing';
import { typography } from '../constants/Typography';
import type { User } from '../migrations/00000-createTableUsers';
import type { LikeUsers } from '../migrations/00010-createTableLikes';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  likes: LikeUsers[];
  userId: User['id'];
};

export default function ModalLike({
  visible,
  onDismiss,
  likes,
  userId,
}: Props) {
  const router = useRouter();

  const renderUserLikes = ({ item }: { item: LikeUsers }) => {
    return (
      <View style={{ marginBottom: spacing.xs }}>
        <Button
          onPress={() =>
            router.navigate({
              pathname:
                userId === item.userId
                  ? '/(tabs)/(user)/user'
                  : '/(tabs)/(user)/[userId]',
              params: { userId: item.userId },
            })
          }
        >
          <Text style={{ ...typography.body }}>{item.name}</Text>
        </Button>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={{
        padding: spacing.md,
        margin: spacing.md,
        borderRadius: 8,
        backgroundColor: colors.background,
      }}
    >
      <Text style={{ ...typography.title, marginBottom: spacing.sm }}>
        Likes
      </Text>
      {likes.length > 0 ? (
        <FlatList data={likes} renderItem={renderUserLikes} />
      ) : (
        <Text>No likes</Text>
      )}

      <Button onPress={onDismiss} style={{ marginTop: spacing.sm }}>
        Close
      </Button>
    </Modal>
  );
}
