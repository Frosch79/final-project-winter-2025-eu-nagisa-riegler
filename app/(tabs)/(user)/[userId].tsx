import { LogoutResponseBodyGet } from '@/app/(auth)/api/logout+api';
import { UserFeedResponseBodyGet } from '@/app/api/feed/[feedId]+api';
import { IsFollowedResponseBodyGet } from '@/app/api/followed/[userId]+api';
import { FollowedUserResponseBodyGet } from '@/app/api/followed/index+api';
import { FollowerUserResponseBodyGet } from '@/app/api/follower/index+api';
import { UserResponseBodyGet } from '@/app/api/user+api';
import { UserPageResponseBodyGet } from '@/app/api/users/[userId]+api';
import UserCard from '@/components/UserCard';
import UserFeed from '@/components/UserFeed';
import { theme } from '@/constants/Theme';
import { FollowUser } from '@/database/followers';
import { FullUser } from '@/database/users';
import { type FeedAlbum } from '@/migrations/00006-createTableAlbums';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, SafeAreaView, View } from 'react-native';
import { Button, HelperText, Provider, Text } from 'react-native-paper';

export default function UserPage() {
  const [isMyPage, setIsMyPage] = useState<boolean>(false);
  const [isFollowed, setIsFollowed] = useState<boolean>(false);
  const [albums, setAlbums] = useState<FeedAlbum[]>([]);
  const [user, setUser] = useState<FullUser>();
  const [follower, setFollower] = useState<FollowUser[]>([]);
  const [followed, setFollowed] = useState<FollowUser[]>([]);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useLocalSearchParams();
  console.log('userid', userId);

  useFocusEffect(
    useCallback(() => {
      async function getUser() {
        setIsLoading(true);

        const [
          userResponse,
          userPageResponse,
          userAlbumsResponse,
          isFollowResponse,
        ]: [
          UserResponseBodyGet,
          UserPageResponseBodyGet,
          UserFeedResponseBodyGet,
          IsFollowedResponseBodyGet,
        ] = await Promise.all([
          fetch('/api/user').then((response) => response.json()),
          fetch(`/api/users/${userId}`).then((response) => response.json()),
          fetch(`/api/feed/${userId}`).then((response) => response.json()),
          fetch(`/api/followed/${userId}`).then((response) => response.json()),
        ]);
        if ('error' in userResponse) {
          router.replace(`/(auth)/login?returnTo=/(tabs)/(user)/[userId]`);
          return;
        }
        setIsMyPage(Number(userId) === Number(userResponse.user.id));

        if ('error' in userPageResponse) {
          console.log('data', userPageResponse.error);
          setIsLoading(false);
          return;
        }

        setUser(userPageResponse.user);

        if ('error' in userAlbumsResponse) {
          setAlbums([]);
          setIsLoading(false);
          return;
        }
        setAlbums(userAlbumsResponse.album);

        if ('error' in isFollowResponse) {
          return;
        }
        console.log('res', isFollowResponse.result.valueOf());
        setIsFollowed(isFollowResponse.result.valueOf());

        const [followerResponse, followedResponse]: [
          FollowerUserResponseBodyGet,
          FollowedUserResponseBodyGet,
        ] = await Promise.all([
          fetch(`/api/follower?userId=${userId}`).then((response) =>
            response.json(),
          ),
          fetch(`/api/followed?userId=${userId}`).then((response) =>
            response.json(),
          ),
        ]);
        if ('error' in followerResponse) {
          setIsError(true);
          setMessage(followerResponse.error);
          setFollower([]);
          return;
        }
        setFollower(followerResponse.user);
        if ('error' in followedResponse) {
          setIsError(true);
          setMessage(followedResponse.error);
          setFollowed([]);
          return;
        }
        setFollowed(followedResponse.user);
        setIsLoading(false);
      }

      getUser().catch(console.error);
    }, [router, userId]),
  );

  // album render
  const renderAlbumFeed = ({ item }: { item: FeedAlbum }) => {
    return (
      <UserFeed
        albumTitle={item.title}
        userName={item.name}
        albumDescription={item.description}
        albumLocation={item.location}
        createdDate={item.createdDate}
        albumCover={''}
        albumComment={item.commentCount}
        albumLike={item.likeCount}
        albumId={item.id}
      />
    );
  };

  //switch follow unfollow
  const userFollowHandel = async () => {
    try {
      const method = isFollowed ? 'DELETE' : 'POST';
      const response = await fetch('/api/followed', {
        method,
        body: JSON.stringify({ followedId: Number(userId) }),
      });
      const data = await response.json();

      if (!response.ok || 'error' in data) {
        setIsError(true);
        setMessage(data.error ?? 'Error updating follow');
        return;
      }

      setIsFollowed(!isFollowed);
    } catch (error) {
      setIsError(true);
      setMessage('Network error');
    }
  };

  return (
    <Provider theme={theme}>
      <SafeAreaView style={{ flex: 1 }}>
        {!isLoading ? (
          <View style={{ flex: 1 }}>
            {user ? (
              <UserCard
                userData={user}
                onSwitch={isMyPage}
                editOnPress={() => router.replace('/album/newAlbum')}
                homeOnPress={() => router.navigate('/(tabs)/(user)/user')}
                followOnPress={userFollowHandel}
                isFollow={isFollowed}
                followerUsersItem={follower}
                followedUsersItem={followed}
              />
            ) : (
              <HelperText type="error"> Account not found</HelperText>
            )}
            {albums.length > 0 ? (
              <FlatList
                data={albums}
                renderItem={renderAlbumFeed}
                keyExtractor={(item: FeedAlbum) => String(item.id)}
              />
            ) : (
              <Text>No Albums</Text>
            )}

            <Button
              onPress={async () => {
                const response = await fetch('/api/logout');

                if (!response.ok) {
                  let errorMessage = 'Error logging out';
                  const responseBody: LogoutResponseBodyGet =
                    await response.json();
                  if ('error' in responseBody) {
                    errorMessage = responseBody.error;
                  }

                  Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
                  return;
                }

                router.push('/(auth)/login');
              }}
            >
              logout
            </Button>
          </View>
        ) : (
          <Text>not found</Text>
        )}
      </SafeAreaView>
    </Provider>
  );
}
