import { colors } from '@/constants/Colors';
import { spacing } from '@/constants/Spacing';
import { typography } from '@/constants/Typography';
import { AlbumByUser } from '@/database/albums';
import { type CommentWithUserName } from '@/database/comments';
import { type LikeUsers } from '@/migrations/00010-createTableLikes';
import dayjs from 'dayjs';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { Button, Card, IconButton, Portal, Text } from 'react-native-paper';
import ModalComment from './ModalComment';
import ModalLike from './ModalLike';

type Props = {
  album: AlbumByUser;
  userId: number;
  albumLikes: LikeUsers[];
  albumComments: CommentWithUserName[];
  onUpdateComment: () => void;
  onUpdateLike: () => void;
};
export default function UserAlbumCard(props: Props) {
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [isLikeModalVisible, setIsLikeModalVisible] = useState(false);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const router = useRouter();

  const { album, userId, albumLikes, albumComments } = props;

  useFocusEffect(
    useCallback(() => {
      setIsError(false);
      setCommentCount(albumComments.length);
      setLikeCount(albumLikes.length);
      const liked = albumLikes.some((obj) => obj.userId === userId);
      setIsLiked(liked);
    }, [albumComments, albumLikes, isLiked, router]),
  );

  const likeHandel = async () => {
    {
      try {
        const method = isLiked ? 'DELETE' : 'POST';
        const response = await fetch('/api/likes', {
          method,
          body: JSON.stringify({ albumId }),
        });
        const data = await response.json();

        if (!response.ok || 'error' in data) {
          setIsError(true);
          setMessage(data.error ?? 'Error updating like');
          return;
        }

        setIsLiked(!isLiked);
        setLikeCount((prev) => prev + (isLiked ? -1 : 1));

        props.onUpdateLike();
      } catch (error) {
        setIsError(true);
        setMessage('Network error');
      }
    }
  };
  const albumId = album.id;
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Card style={{ borderRadius: 6, overflow: 'hidden' }}>
        <Card.Title
          title={album.title}
          subtitle={album.description}
          titleStyle={typography.title}
        />
        <Card.Content>
          <Button
            onPress={() =>
              router.navigate({
                pathname:
                  userId === album.userId
                    ? '/(tabs)/(user)/user'
                    : '/(tabs)/(user)/[userId]',
                params: { userId: album.userId },
              })
            }
          >
            <Text>{album.userName}</Text>
          </Button>

          <Text
            style={{
              ...typography.title,
              marginTop: spacing.xs,
            }}
          >
            {album.location}
          </Text>
          <Text style={{ ...typography.small }}>
            {dayjs(album.createdDate).format('YYYY-MM-DD')}
          </Text>
        </Card.Content>

        <Card.Cover
          style={{
            borderRadius: 0,
          }}
          source={{ uri: 'https://picsum.photos/700' }}
        />
        <Card.Actions
          style={{ justifyContent: 'space-between', marginTop: spacing.sm }}
        >
          {/* Likes */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconButton
              icon="heart"
              iconColor={isLiked ? colors.like : colors.textSecondary}
              onPress={async () => likeHandel()}
            />

            <Text style={{ ...typography.body }}>{likeCount} </Text>
            <Button onPress={() => setIsLikeModalVisible(true)}>
              <Text>show likes...</Text>
            </Button>
          </View>
          {/* Comments */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconButton
              icon="comment"
              onPress={() => setIsCommentModalVisible(true)}
            />
            <Text style={{ ...typography.body }}>{commentCount}</Text>
          </View>

          {isError ? (
            <Text style={{ color: colors.like }}>{message}</Text>
          ) : null}
        </Card.Actions>
      </Card>

      <Portal>
        <ModalComment
          visible={isCommentModalVisible}
          onDismiss={() => setIsCommentModalVisible(false)}
          albumId={album.id}
          comments={albumComments}
          userId={userId}
          onUpdateComment={props.onUpdateComment}
        />
      </Portal>
      <Portal>
        <ModalLike
          visible={isLikeModalVisible}
          onDismiss={() => setIsLikeModalVisible(false)}
          likes={albumLikes}
          userId={userId}
        />
      </Portal>
    </View>
  );
}
