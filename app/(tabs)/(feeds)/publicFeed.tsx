import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, SafeAreaView, Text } from 'react-native';
import UserFeed from '../../../components/UserFeed';
import type { FeedAlbum } from '../../../migrations/00006-createTableAlbums';
import { type FeedResponseBodyGet } from '../../api/feed/index+api';
import type { UserResponseBodyGet } from '../../api/user+api';

export default function Feed() {
  const [publicFeed, setPublicFeed] = useState<FeedAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      const getUserFeed = async () => {
        setIsLoading(false);
        const [userResponse, userPublicFeedResponse]: [
          UserResponseBodyGet,
          FeedResponseBodyGet,
        ] = await Promise.all([
          fetch('/api/user').then((response) => response.json()),
          fetch('/api/feed?visibility=public').then((response) =>
            response.json(),
          ),
        ]);

        if ('error' in userResponse) {
          router.replace('/(auth)/login?returnTo=/(tabs)/(feeds)/publicFeed');
          return;
        }
        if ('error' in userPublicFeedResponse) {
          setPublicFeed([]);
          setIsLoading(true);
        }

        if ('feedAlbum' in userPublicFeedResponse) {
          setPublicFeed(userPublicFeedResponse.feedAlbum);
          setIsLoading(true);
        }
      };

      getUserFeed().catch((error) => console.log(error));
    }, []),
  );

  return (
    <SafeAreaView>
      {publicFeed.length > 0 && isLoading ? (
        <FlatList
          data={publicFeed}
          renderItem={renderAlbumFeed}
          keyExtractor={(item: FeedAlbum) => String(item.id)}
        />
      ) : (
        <Text>No Albums</Text>
      )}
    </SafeAreaView>
  );
}
