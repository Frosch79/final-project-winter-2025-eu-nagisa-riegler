import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import { Button, Card, HelperText, Text, TextInput } from 'react-native-paper';
import { uploadImage } from '../../components/CloudinaryUpload';
import { components } from '../../constants/Components';
import type { AlbumByUser } from '../../database/albums';
import type { AlbumResponseBodyGet } from '../api/albums/[albumId]+api';
import type { CreatePhotoResponseBodyPost } from '../api/photos/index+api';
import type { UserResponseBodyGet } from '../api/user+api';

export default function PostMyPhotos() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [cloudinaryPath, setCloudinaryPath] = useState<string | undefined>(
    undefined,
  );
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [album, setAlbum] = useState<AlbumByUser>();

  const { albumId } = useLocalSearchParams<{ albumId: string }>();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      async function loadAlbum() {
        /* fetch cloudinary */
        /* create photo data */

        const [userResponse, albumResponse]: [
          UserResponseBodyGet,
          AlbumResponseBodyGet,
        ] = await Promise.all([
          fetch('/api/user').then((response) => response.json()),
          fetch(`/api/albums/${albumId}`).then((response) => response.json()),
        ]);

        if ('error' in userResponse) {
          router.replace('/(auth)/login?returnTo=/photos/photo/');
          return;
        }
        if ('error' in albumResponse) {
          setMessage(albumResponse.error);
          return;
        }
        if ('album' in albumResponse) {
          setAlbum(albumResponse.album);
        }
        setMessage('');
      }

      loadAlbum().catch((error) => {
        console.log(error);
      });
    }, [albumId, router]),
  );

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (result.canceled) return;

    const image = result.assets[0];
    if (!image) return;

    const url = await uploadImage(image.uri);

    setCloudinaryPath(url);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Card style={{ borderRadius: components.card.style.borderRadius }}>
          {/* album title */}
          <Card.Title title={album?.title} subtitle={album?.description} />
          <Card.Content>
            {/* image preview */}
            <View
              style={{
                width: '100%',
                height: 260,

                borderRadius: components.card.style.borderRadius,
                overflow: 'hidden',
                marginBottom: 16,
              }}
            >
              {cloudinaryPath ? (
                <Card.Cover
                  testID="upload-photo"
                  style={{
                    width: 300,
                    aspectRatio: 4 / 3,
                    alignSelf: 'center',
                    borderRadius: 8,
                  }}
                  source={{ uri: cloudinaryPath }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text variant="bodyMedium">No Image Selected</Text>
                </View>
              )}
            </View>

            <Button
              testID="select-photo"
              mode="contained"
              onPress={pickImageAsync}
              style={{
                borderRadius: components.button.borderRadius,
                marginBottom: 12,
              }}
            >
              <Text>SELECT PHOTO</Text>
            </Button>
            {/* title */}
            <TextInput
              label="Photo Title"
              value={title}
              onChangeText={(text) => setTitle(text)}
            />
            {/* description */}
            <TextInput
              label="Description"
              value={description}
              onChangeText={(text) => setDescription(text)}
              style={{ marginBottom: 12 }}
            />
            {/* location */}
            <TextInput
              label="Location"
              value={location}
              onChangeText={(text) => setLocation(text)}
              style={{ marginBottom: 12 }}
            />
          </Card.Content>

          <HelperText type="error" visible={isError}>
            {message}
          </HelperText>

          {album ? (
            <Card.Actions
              testID="post-button"
              style={{ justifyContent: 'space-between' }}
            >
              <Button
                testID="cancel-button"
                onPress={() =>
                  router.replace({
                    pathname: '/album/[albumId]',
                    params: { albumId: album.id },
                  })
                }
              >
                <Text>Cancel</Text>
              </Button>
              <Button
                testID="continue-button"
                mode="contained"
                disabled={!cloudinaryPath}
                onPress={async () => {
                  const response = await fetch(`/api/photos`, {
                    method: 'POST',
                    body: JSON.stringify({
                      title: title,
                      cloudinaryDataPath: cloudinaryPath,
                      description: description,
                      location: location,
                      albumId: Number(albumId),
                    }),
                  });

                  if (!response.ok) {
                    let errorMessage = 'Error Create Photo';
                    const photoResponse: CreatePhotoResponseBodyPost =
                      await response.json();
                    if ('error' in photoResponse) {
                      errorMessage = photoResponse.error;
                    }

                    setIsError(true);
                    setMessage(errorMessage);

                    return;
                  }

                  const createdPhotoResponse: CreatePhotoResponseBodyPost =
                    await response.json();

                  if ('error' in createdPhotoResponse) {
                    setIsError(true);
                    setMessage(createdPhotoResponse.error);
                    return;
                  }

                  setTitle('');
                  setDescription('');
                  setLocation('');
                  if ('photo' in createdPhotoResponse) {
                    router.replace({
                      pathname: '/album/[albumId]',
                      params: { albumId: album.id },
                    });
                  }
                }}
              >
                <Text>Ok</Text>
              </Button>
            </Card.Actions>
          ) : null}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
