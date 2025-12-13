import { UserResponseBodyGet } from '@/app/api/user+api';
import UserFeed from '@/components/UserFeed';
import { type FeedAlbum } from '@/migrations/00006-createTableAlbums';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, SafeAreaView, Text } from 'react-native';
import { FeedResponseBodyGet } from '../../api/feed/index+api';

export default function Feed() {
  const [followFeed, setFollowFeed] = useState<FeedAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useFocusEffect(
    useCallback(() => {
      const getUserFeed = async () => {
        const [userResponse, userFollowsFeedResponse]: [
          UserResponseBodyGet,
          FeedResponseBodyGet,
        ] = await Promise.all([
          fetch('/api/user').then((response) => response.json()),
          fetch('/api/feed?visibility=followersOnly').then((response) =>
            response.json(),
          ),
        ]);
        setIsLoading(false);
        if ('error' in userResponse) {
          router.replace('/(auth)/login?returnTo=/(tabs)/(feeds)followsFeed');
          return;
        }

        if ('error' in userFollowsFeedResponse) {
          setFollowFeed([]);
        }

        if ('feedAlbum' in userFollowsFeedResponse) {
          setFollowFeed(userFollowsFeedResponse.feedAlbum);
        }
      };
      getUserFeed().catch((error) => console.log(error));
    }, [isLoading, router]),
  );

  return (
    <SafeAreaView>
      {followFeed.length > 0 ? (
        <FlatList
          data={followFeed}
          renderItem={renderAlbumFeed}
          keyExtractor={(item: FeedAlbum) => String(item.id)}
        />
      ) : (
        <Text>No Albums</Text>
      )}
    </SafeAreaView>
  );
}
