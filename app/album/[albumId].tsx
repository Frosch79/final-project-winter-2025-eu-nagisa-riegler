import { UserResponseBodyGet } from '@/app/api/user+api';
import UserAlbumCard from '@/components/UserAlbumCard';
import { components } from '@/constants/Components';
import { layout } from '@/constants/Layout';
import { spacing } from '@/constants/Spacing';
import { theme } from '@/constants/Theme';
import { typography } from '@/constants/Typography';
import { type AlbumByUser } from '@/database/albums';
import { type CommentWithUserName } from '@/database/comments';
import { type FullUser } from '@/database/users';
import { type Photo } from '@/migrations/00008-createTablePhotos';
import { type LikeUsers } from '@/migrations/00010-createTableLikes';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Dimensions, FlatList, Image, SafeAreaView, View } from 'react-native';
import {
  Button,
  HelperText,
  IconButton,
  Provider,
  Text,
} from 'react-native-paper';
import { AlbumResponseBodyGet } from '../api/albums/[albumId]+api';
import { AlbumCommentsResponseBodyGet } from '../api/comments/index+api';
import { AlbumLikesResponseBodyGet } from '../api/likes/index+api';

//styling
const screenWidth = Dimensions.get('window').width;
const numColumns = 3;
const gridSpacing = spacing.sm * (numColumns + 1);
const cardSize = (screenWidth - gridSpacing) / numColumns;

export default function UserAlbum() {
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<FullUser>();
  const [album, setAlbum] = useState<AlbumByUser>();
  const { albumId } = useLocalSearchParams();
  const router = useRouter();

  //photo render
  const renderUserPhotos = ({ item }: { item: Photo }) => {
    return (
      <Button
        style={{ padding: spacing.xs }}
        onPress={() =>
          router.navigate({
            pathname: '/photos/[photoId]',
            params: { photoId: item.id },
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
            source={{
              uri: item.cloudinaryDataPath,
            }}
          />
        </View>
      </Button>
    );
  };
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
  return (
    <Provider theme={theme}>
      <SafeAreaView style={layout.container}>
        {/* album card */}
        <View style={{ marginBottom: spacing.md }}>
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
        {/* Action Buttons (for owner) */}
        <View>
          {user && album && user.id === album.userId ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: spacing.md,
              }}
            >
              <IconButton
                //close album page
                mode="contained-tonal"
                icon="close-thick"
                size={30}
                onPress={() => router.replace('/(tabs)/(user)/user')}
              />
              <IconButton
                //to edit page
                mode="contained-tonal"
                icon="file-edit"
                size={30}
                onPress={() =>
                  router.replace({
                    pathname: '/album/editAlbum/[editId]',
                    params: { editId: Number(albumId) },
                  })
                }
              />
              <IconButton
                //add new photo
                mode="contained-tonal"
                icon="camera"
                size={30}
                onPress={() =>
                  router.replace({
                    pathname: '/photos/photo',
                    params: { albumId: albumId },
                  })
                }
              />
            </View>
          ) : null}
        </View>

        {album && album.photos.length > 0 ? (
          <FlatList
            data={album.photos}
            renderItem={renderUserPhotos}
            keyExtractor={(item: Photo) => String(item.id)}
            numColumns={numColumns}
          />
        ) : (
          <Text style={{ ...typography.body }}>No Photos</Text>
        )}
      </SafeAreaView>
    </Provider>
  );
}
