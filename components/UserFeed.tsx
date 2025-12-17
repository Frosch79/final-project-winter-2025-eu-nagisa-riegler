import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Avatar, Button, Card, IconButton, Text } from 'react-native-paper';
import { components } from '../constants/Components';
import { spacing } from '../constants/Spacing';
import { typography } from '../constants/Typography';

type Props = {
  albumTitle: string;
  userName: string;
  albumDescription: string | null;
  albumLocation: string | null;
  createdDate: Date;
  albumCover: string;
  albumComment: number;
  albumLike: number;
  albumId: number;
};
export default function UserFeed(props: Props) {
  const {
    albumTitle,
    userName,
    albumDescription,
    albumLocation,
    createdDate,
    albumCover,
    albumComment,
    albumLike,
    albumId,
  } = props;
  const leftContent = () => (
    <Avatar.Text size={40} label={userName[0] || '?'} />
  );
  const router = useRouter();

  return (
    <Card
      style={{
        borderRadius: components.card.style.borderRadius,
        marginBottom: spacing.md,
        overflow: 'hidden',
      }}
    >
      <Card.Title
        title={userName}
        subtitle={dayjs(createdDate).format('YYYY-MM-DD')}
        left={leftContent}
        titleStyle={{ ...typography.title }}
      />

      <Button
        onPress={() =>
          router.navigate({
            pathname: '/album/[albumId]',
            params: { albumId: albumId.toString() },
          })
        }
        style={{ padding: 0 }}
      >
        <Card.Content style={{ paddingBottom: spacing.sm }}>
          <Text style={{ ...typography.title, marginBottom: spacing.xs }}>
            {albumTitle}
          </Text>
          {albumDescription && <Text>{albumDescription}</Text>}
          {albumLocation && (
            <Text
              style={{
                ...typography.small,
                marginTop: spacing.xs,
              }}
            >
              {albumLocation}
            </Text>
          )}
        </Card.Content>
      </Button>
      <Card.Cover
        style={{ width: '100%', height: 180, borderRadius: 0 }}
        source={{ uri: albumCover || 'https://picsum.photos/700' }}
      />

      <Card.Content
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          marginTop: spacing.sm,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton icon="heart-outline" size={20} />
          <Text>{albumLike}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: spacing.md,
          }}
        >
          <IconButton icon="comment-outline" size={20} />
          <Text>{albumComment}</Text>
        </View>
      </Card.Content>
    </Card>
  );
}
