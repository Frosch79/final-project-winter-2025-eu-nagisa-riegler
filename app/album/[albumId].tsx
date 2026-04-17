import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Button,
  HelperText,
  IconButton,
  Provider,
  Text,
} from 'react-native-paper';
import UserAlbumCard from '../../components/UserAlbumCard';
import { components } from '../../constants/Components';
import { layout } from '../../constants/Layout';
import { spacing } from '../../constants/Spacing';
import { theme } from '../../constants/Theme';
import { typography } from '../../constants/Typography';
import type { AlbumByUser } from '../../database/albums';
import type { CommentWithUserName } from '../../database/comments';
import type { FullUser } from '../../database/users';
import type { Photo } from '../../migrations/00008-createTablePhotos';
import type { LikeUsers } from '../../migrations/00010-createTableLikes';
import { type AlbumResponseBodyGet } from '../api/albums/[albumId]+api';
import { type AlbumCommentsResponseBodyGet } from '../api/comments/index+api';
import { type AlbumLikesResponseBodyGet } from '../api/likes/index+api';
import type { UserResponseBodyGet } from '../api/user+api';

// styling

export default function UserAlbum() {
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<FullUser>();
  const [album, setAlbum] = useState<AlbumByUser>();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const { albumId, from } = useLocalSearchParams<{
    albumId: string;
    from?: string;
  }>();
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const numColumns = 3;

  const contentWidth = windowWidth > 600 ? 600 : windowWidth;

  const gridSpacing = spacing.sm * (numColumns + 1);
  const cardSize = (contentWidth - gridSpacing) / numColumns;

  useFocusEffect(
    useCallback(() => {
      const getAlbum = async () => {
        const [userResponse, albumResponse]: [
          UserResponseBodyGet,
          AlbumResponseBodyGet,
        ] = await Promise.all([
          fetch('/api/user').then((response) => response.json()),
          fetch(`/api/albums/${albumId}`).then((response) => response.json()),
        ]);

        if ('error' in userResponse) {
          router.replace(`/(auth)/login?returnTo=/album/${albumId}`);
          return;
        }
        if ('error' in albumResponse) {
          setMessage(albumResponse.error);
        }
        if ('user' in userResponse) {
          setUser(userResponse.user);
        }
        if ('album' in albumResponse) {
          setAlbum(albumResponse.album);
          if ('photos' in albumResponse.album) {
            setPhotos(albumResponse.album.photos as Photo[]);
          } else {
            setPhotos([]);
          }
        }
      };

      getAlbum().catch((error) => console.log(error));
    }, [albumId, router]),
  );

  const [userComments, setUserComments] = useState<CommentWithUserName[]>([]);
  const [userLikes, setUserLikes] = useState<LikeUsers[]>([]);
  // get Likes / Comments
  useFocusEffect(
    useCallback(() => {
      const getAllLikesAndComments = async () => {
        const [likeResponse, commentResponse]: [
          AlbumLikesResponseBodyGet,
          AlbumCommentsResponseBodyGet,
        ] = await Promise.all([
          fetch(`/api/likes?album=${albumId}`).then((response) =>
            response.json(),
          ),
          fetch(`/api/comments?album=${albumId}`).then((response) =>
            response.json(),
          ),
        ]);

        if ('error' in commentResponse) {
          setUserComments([]);
        }

        if ('error' in likeResponse) {
          setUserLikes([]);

          return;
        }
        if ('comment' in commentResponse) {
          setUserComments(commentResponse.comment);
        }
        if ('like' in likeResponse) {
          setUserLikes(likeResponse.like);

          return;
        }
      };
      getAllLikesAndComments().catch((error) => console.log(error));
    }, [albumId]),
  );

  // photo render
  const renderUserPhotos = ({ item }: { item: Photo }) => {
    return (
      <View style={{ width: cardSize, height: cardSize }}>
        <Button
          testID="photo"
          style={{ padding: 0, margin: 0, width: '100%', height: '100%' }}
          onPress={() =>
            router.navigate({
              pathname: '/photos/[photoId]',
              params: { photoId: Number(item.id) },
            })
          }
        >
          <View
            style={{
              width: cardSize,
              height: cardSize,
              borderRadius: components.card.image.borderRadius,
              overflow: 'hidden',
            }}
          >
            <Image
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
              source={{ uri: item.cloudinaryDataPath }}
            />
          </View>
        </Button>
      </View>
    );
  };
  // reload Likes / Comments
  const reloadComments = async () => {
    const commentResponse: AlbumCommentsResponseBodyGet = await fetch(
      `/api/comments?album=${albumId}`,
    ).then((response) => response.json());

    if ('comment' in commentResponse) {
      setUserComments(commentResponse.comment);
    } else {
      setUserComments([]);
    }
  };

  const reloadLikes = async () => {
    const likeResponse: AlbumLikesResponseBodyGet = await fetch(
      `/api/likes?album=${albumId}`,
    ).then((response) => response.json());

    if ('like' in likeResponse) {
      setUserLikes(likeResponse.like);
    } else {
      setUserLikes([]);
    }
  };

  const handleBack = () => {
    if (from === 'editAlbum') {
      router.replace('/(user)/user');
    } else {
      router.back();
    }
  };

  return (
    <Provider theme={theme}>
      <SafeAreaView
        style={{ ...layout.container, flex: 1, marginBottom: '10%' }}
      >
        <FlatList
          data={photos}
          renderItem={renderUserPhotos}
          numColumns={numColumns}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={
            <>
              {/* album card */}
              <View style={{}}>
                {album && user ? (
                  <UserAlbumCard
                    album={album}
                    userId={Number(user.id)}
                    albumLikes={userLikes}
                    albumComments={userComments}
                    onUpdateComment={reloadComments}
                    onUpdateLike={reloadLikes}
                  />
                ) : (
                  <HelperText type="error">{message}</HelperText>
                )}
              </View>

              {/* Action Buttons */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: spacing.md,
                }}
              >
                <IconButton
                  testID="exit-album"
                  mode="contained-tonal"
                  icon="close-thick"
                  size={30}
                  onPress={handleBack}
                />

                {user && album && user.id === album.userId && (
                  <>
                    <IconButton
                      testID="album-edit"
                      mode="contained-tonal"
                      icon="file-edit"
                      size={30}
                      onPress={() =>
                        router.replace({
                          pathname: '/album/editAlbum/[editId]',
                          params: { editId: album.id },
                        })
                      }
                    />
                    <IconButton
                      testID="photo-create"
                      mode="contained-tonal"
                      icon="camera"
                      size={30}
                      onPress={() =>
                        router.replace({
                          pathname: '/photos/photo',
                          params: { albumId },
                        })
                      }
                    />
                  </>
                )}
              </View>
            </>
          }
          ListEmptyComponent={
            <Text style={{ ...typography.body }}>No Photos</Text>
          }
        />
      </SafeAreaView>
    </Provider>
  );
}
