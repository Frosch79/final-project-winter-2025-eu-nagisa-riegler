import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, SafeAreaView, View } from 'react-native';
import { Button, Provider, Text } from 'react-native-paper';
import type { LogoutResponseBodyGet } from '../../(auth)/api/logout+api';
import UserCard from '../../../components/UserCard';
import UserFeed from '../../../components/UserFeed';
import { colors } from '../../../constants/Colors';
import { theme } from '../../../constants/Theme';
import type { FollowUser } from '../../../database/followers';
import type { FullUser } from '../../../database/users';
import type { FeedAlbum } from '../../../migrations/00006-createTableAlbums';
import type { UserFeedResponseBodyGet } from '../../api/feed/[feedId]+api';
import type { FollowedUserResponseBodyGet } from '../../api/followed/index+api';
import type { FollowerUserResponseBodyGet } from '../../api/follower/index+api';
import type { UserResponseBodyGet } from '../../api/user+api';

export default function UserPage() {
  const [isMyPage, setIsMyPage] = useState<boolean>(false);

  const [albums, setAlbums] = useState<FeedAlbum[]>([]);
  const [user, setUser] = useState<FullUser>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [follower, setFollower] = useState<FollowUser[]>([]);
  const [followed, setFollowed] = useState<FollowUser[]>([]);

  const renderAlbumFeed = ({ item }: { item: FeedAlbum }) => {
    return (
      <UserFeed
        albumTitle={item.title}
        userName={item.name}
        albumDescription={item.description}
        albumLocation={item.location}
        createdDate={item.createdDate}
        albumCover=""
        albumComment={item.commentCount}
        albumLike={item.likeCount}
        albumId={item.id}
      />
    );
  };

  useFocusEffect(
    useCallback(() => {
      async function getUser() {
        const userResponse: UserResponseBodyGet = await fetch('/api/user').then(
          (response) => response.json(),
        );

        if ('error' in userResponse) {
          router.replace(`/(auth)/login?returnTo=/(tabs)/(user)/user`);
          return;
        }
        if ('user' in userResponse) {
          setUser(userResponse.user);
        }

        const pageId = userResponse.user.id;

        setIsMyPage(true);

        const userAlbumsResponse: UserFeedResponseBodyGet = await fetch(
          `/api/feed/${pageId}`,
        ).then((response) => response.json());

        if ('error' in userAlbumsResponse) {
          setAlbums([]);
        }
        if ('album' in userAlbumsResponse) {
          setAlbums(userAlbumsResponse.album);
        }
        const [followerResponse, followedResponse]: [
          FollowerUserResponseBodyGet,
          FollowedUserResponseBodyGet,
        ] = await Promise.all([
          fetch(`/api/follower?userId=${pageId}`).then((response) =>
            response.json(),
          ),
          fetch(`/api/followed?userId=${pageId}`).then((response) =>
            response.json(),
          ),
        ]);
        if ('error' in followerResponse) {
          setFollower([]);
        }
        if ('error' in followedResponse) {
          setFollowed([]);
        }
        if ('user' in followerResponse) {
          setFollower(followerResponse.user);
        }

        if ('user' in followedResponse) {
          setFollowed(followedResponse.user);
        }
        setIsLoading(false);
      }
      getUser().catch((error) => {
        console.log(error);
      });
    }, [router]),
  );

  return (
    <Provider theme={theme}>
      <SafeAreaView style={{ flex: 1 }}>
        {!isLoading ? (
          <View style={{ flex: 1 }} testID="user-page">
            {user ? (
              <UserCard
                userData={user}
                onSwitch={isMyPage}
                editOnPress={() => router.replace('/album/newAlbum')}
                homeOnPress={() => router.navigate('/(tabs)/(user)/user')}
                followOnPress={undefined}
                isFollow={false}
                followedUsersItem={followed}
                followerUsersItem={follower}
                editMyAccount={() =>
                  router.navigate('/(tabs)/(user)/(editAccount)/editAccount')
                }
              />
            ) : null}

            {albums.length > 0 ? (
              <FlatList
                data={albums}
                renderItem={renderAlbumFeed}
                keyExtractor={(item: FeedAlbum) => String(item.id)}
              />
            ) : (
              <Text>No Albums</Text>
            )}
          </View>
        ) : (
          <Text> not found</Text>
        )}
        <Button
          testID="logout-button"
          onPress={async () => {
            const response = await fetch('/api/logout');

            if (!response.ok) {
              let errorMessage = 'Error logging out';
              const responseBody: LogoutResponseBodyGet = await response.json();
              if ('error' in responseBody) {
                errorMessage = responseBody.error;
              }

              Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
              return;
            }
            router.push('/(auth)/login');
          }}
        >
          <Text style={{ color: colors.accent }}>logout</Text>
        </Button>
      </SafeAreaView>
    </Provider>
  );
}
