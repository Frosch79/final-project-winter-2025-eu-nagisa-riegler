import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Avatar, Card, IconButton, Text } from 'react-native-paper';
import { colors } from '../constants/Colors';
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
      {/* user and date */}
      <Card.Title
        title={userName}
        subtitle={dayjs(createdDate).format('YYYY-MM-DD')}
        left={leftContent}
        titleStyle={{ ...typography.title }}
      />
      <View
        style={{
          flexDirection: 'row',
          gap: 24,
          paddingHorizontal: 2,
          paddingBottom: 5,
        }}
      >
        <Pressable
          onPress={() =>
            router.navigate({
              pathname: '/album/[albumId]',
              params: { albumId: albumId },
            })
          }
          style={{
            flexDirection: 'row',
            padding: spacing.md,
            alignItems: 'flex-start',
            flex: 1,
          }}
        >
          {/* cover */}
          <Card.Cover
            source={{ uri: albumCover || 'https://picsum.photos/700' }}
            style={{
              width: 140,
              aspectRatio: 2 / 3,
              borderRadius: 8,
              marginRight: spacing.md,
            }}
            resizeMode="contain"
          />
          {/* album information */}
          <View style={{ flex: 1, marginRight: spacing.md }}>
            <Text style={{ ...typography.title, marginBottom: spacing.xs }}>
              {albumTitle}
            </Text>
            {albumDescription && (
              <Text style={{ ...typography.body, marginBottom: spacing.xs }}>
                {albumDescription}
              </Text>
            )}
            {albumLocation && (
              <Text
                style={{ ...typography.small, color: colors.textSecondary }}
              >
                {albumLocation}
              </Text>
            )}
          </View>
        </Pressable>
      </View>

      {/* actions */}
      <Card.Content
        style={{
          flexDirection: 'row',
          marginTop: spacing.sm,
          gap: spacing.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton icon="heart-outline" size={20} />
          <Text>{albumLike}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton icon="comment-outline" size={20} />
          <Text>{albumComment}</Text>
        </View>
      </Card.Content>
    </Card>
  );
}
