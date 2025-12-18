import dayjs from 'dayjs';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { Button, Card, IconButton, Portal, Text } from 'react-native-paper';
import { colors } from '../constants/Colors';
import { spacing } from '../constants/Spacing';
import { typography } from '../constants/Typography';
import type { AlbumByUser } from '../database/albums';
import type { CommentWithUserName } from '../database/comments';
import type { LikeUsers } from '../migrations/00010-createTableLikes';
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
    }, [albumComments.length, albumLikes, userId]),
  );

  const likeHandel = async () => {
    const method = isLiked ? 'DELETE' : 'POST';
    const response = await fetch('/api/likes', {
      method,
      body: JSON.stringify({ albumId: album.id }),
    });
    const data = await response.json();

    if (!response.ok || 'error' in data) {
      setIsError(true);
      setMessage(data ?? 'Error updating like');
      return;
    }

    setIsLiked(!isLiked);
    setLikeCount((prev) => prev + (isLiked ? -1 : 1));

    props.onUpdateLike();
  };

  return (
    <View style={{ ...typography, marginBottom: spacing.md }}>
      <View style={{ marginVertical: 24, paddingHorizontal: 24 }}>
        <Card
          style={{
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: colors.surface,
          }}
        >
          {/* user, created date */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              paddingVertical: 16,
              paddingHorizontal: 16,
            }}
          >
            <Button
              style={{
                alignSelf: 'flex-start',
                paddingHorizontal: 16,
                borderRadius: 30,
                marginRight: spacing.lg,
              }}
              mode="outlined"
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
              <Text style={{ color: colors.accent }}>{album.userName}</Text>
            </Button>

            <Text style={{ fontSize: 14, color: colors.outline }}>
              Created: {dayjs(album.createdDate).format('YYYY-MM-DD')}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              gap: 24,
              paddingHorizontal: 16,
              paddingBottom: 16,
            }}
          >
            {/* cover*/}
            <Card.Cover
              style={{
                width: 220,
                aspectRatio: 3 / 4,
                borderRadius: 8,
              }}
              source={{ uri: 'https://picsum.photos/700' }}
            />

            {/* album  */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '600',
                  color: '#FFFFFF',
                  marginBottom: 8,
                }}
              >
                {album.title}
              </Text>

              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  color: '#A0B2B0',
                  marginBottom: 8,
                }}
              >
                {album.description}
              </Text>

              {album.location ? (
                <Text style={{ fontSize: 14, color: '#8C8C8C' }}>
                  {album.location}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Actions */}
          <Card.Actions
            style={{ justifyContent: 'flex-start', paddingHorizontal: 16 }}
          >
            {/* Likes */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconButton
                icon="heart"
                iconColor={isLiked ? colors.like : colors.textSecondary}
                onPress={async () => await likeHandel()}
              />
              <Text style={{ fontSize: 16, color: colors.white }}>
                {likeCount}
              </Text>
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
              <Text style={{ fontSize: 16 }}>{commentCount}</Text>
            </View>

            {isError ? (
              <Text style={{ color: colors.like }}>{message}</Text>
            ) : null}
          </Card.Actions>
        </Card>
      </View>

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
