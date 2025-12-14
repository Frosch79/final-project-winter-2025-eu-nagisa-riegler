import { useRouter } from 'expo-router';
import { FlatList, View } from 'react-native';
import { Button, Modal, Text } from 'react-native-paper';
import { colors } from '../constants/Colors';
import { spacing } from '../constants/Spacing';
import { typography } from '../constants/Typography';
import type { FollowUser } from '../database/followers';
import type { User } from '../migrations/00000-createTableUsers';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  items: FollowUser[];
  idSwitch: string;
  userId: User['id'];
};
export default function namModalShowFollows({
  visible,
  onDismiss,
  items,
  idSwitch,
  userId,
}: Props) {
  const router = useRouter();

  const renderFollows = ({ item }: { item: FollowUser }) => {
    const targetUserId =
      idSwitch === 'follower' ? item.followerUserId : item.followedUserId;
    const isMyPage = userId === targetUserId;
    console.log(
      userId === item.followedUserId
        ? '/(tabs)/(user)/user'
        : '/(tabs)/(user)/[userId]',
    );

    return (
      <View style={{ marginBottom: spacing.xs }}>
        <Button
          onPress={() =>
            router.navigate({
              pathname: isMyPage
                ? '/(tabs)/(user)/user'
                : '/(tabs)/(user)/[userId]',
              params: { userId: targetUserId },
            })
          }
        >
          <Text style={{ ...typography.body }}>{item.userName}</Text>
        </Button>
      </View>
    );
  };
  console.log('items', items, 'switch', idSwitch);
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
        {idSwitch === 'follower' ? 'Follower' : 'Followed'}
      </Text>
      {items.length > 0 ? (
        <FlatList data={items} renderItem={renderFollows} />
      ) : (
        <Text>No Users</Text>
      )}

      <Button onPress={onDismiss} style={{ marginTop: spacing.sm }}>
        Close
      </Button>
    </Modal>
  );
}
