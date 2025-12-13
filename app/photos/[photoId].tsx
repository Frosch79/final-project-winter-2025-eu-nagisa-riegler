import UserPhotoCard from '@/components/UserPhotoCard';
import type { Photo } from '@/migrations/00008-createTablePhotos';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import { HelperText } from 'react-native-paper';
import { PhotoResponseBodyGet } from '../api/photos/[photoId]+api';
import { UserResponseBodyGet } from '../api/user+api';

export default function Photo() {
  const [photoData, setPhotoData] = useState<Photo>();
  const [isLoading, setIsLoading] = useState(false);
  const { photoId } = useLocalSearchParams();

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const getUserPhoto = async () => {
        const [userResponse, photoResponse]: [
          UserResponseBodyGet,
          PhotoResponseBodyGet,
        ] = await Promise.all([
          fetch('/api/user').then((response) => response.json()),
          fetch(`/api/photos/${photoId}`).then((response) => response.json()),
        ]);

        if ('error' in userResponse) {
          router.replace(`/(auth)/login?returnTo=/photos/${photoId}`);
          return;
        }
        if ('error' in photoResponse) {
          return;
        }
        if ('photo' in photoResponse) {
          setPhotoData(photoResponse.photo);
          setIsLoading(true);
          console.log('res', photoResponse.photo);
        }
      };
      getUserPhoto().catch((error) => console.log(error));
    }, [photoId]),
  );
  if (photoData)
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView>
          {isLoading ? (
            <UserPhotoCard
              photoTitle={photoData.title}
              photoDescription={photoData.description}
              photoLocation={photoData.location}
              photoUri={photoData.cloudinaryDataPath}
              createdDate={photoData.createdDate}
            />
          ) : (
            <HelperText type="error">Sorry! photo does not exist.</HelperText>
          )}
        </ScrollView>
      </SafeAreaView>
    );
}
