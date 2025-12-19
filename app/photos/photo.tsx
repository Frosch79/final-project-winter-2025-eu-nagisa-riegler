import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, View } from 'react-native';
import { Button, Card, HelperText, Text, TextInput } from 'react-native-paper';
import { components } from '../../constants/Components';
import type { AlbumByUser } from '../../database/albums';
import type { AlbumResponseBodyGet } from '../api/albums/[albumId]+api';
import type { CreatePhotoResponseBodyPost } from '../api/photos/index+api';
import type { UserResponseBodyGet } from '../api/user+api';

type CloudinaryUploadResponse = {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
};

// Compress image before upload (web only)
async function compressBlob(blob: Blob): Promise<Blob> {
  const img = new Image();
  img.src = URL.createObjectURL(blob);
  await new Promise((r) => {
    img.onload = r;
  });

  const maxWidth = 1600;
  const scale = Math.min(1, maxWidth / img.width);

  const canvas = document.createElement('canvas');
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);

  return await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.7);
  });
}

export default function PostMyPhotos() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [cloudinaryPath, setCloudinaryPath] = useState<string | undefined>(
    undefined,
  );
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState<string | null>('');
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
        setMessage(null);
      }

      loadAlbum().catch((error) => {
        console.error(error);
      });
    }, [albumId, router]),
  );

  const pickImageAsync = async () => {
    /* add photo to cloudinary  */

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (result.canceled) return;
    const image = result.assets[0];
    if (!image) return;

    const blob = await fetch(image.uri).then((response) => response.blob());

    const uploadBlob = Platform.OS === 'web' ? await compressBlob(blob) : blob;

    const file = {
      uri: image.uri,
      type: image.mimeType ?? 'image/jpeg',
      name: 'upload.jpg',
    };

    // get sign

    const sigRes = await fetch('/api/cloudinary/sign'); // get sign of cloudinary

    const { timestamp, signature, cloudName, apiKey } = await sigRes.json();

    // FormData sends to cloudinary
    const formData = new FormData();
    formData.append(
      'file',
      Platform.OS === 'web' ? uploadBlob : (file as any),
      'upload.jpg',
    );
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', 'my_app');

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    const data: CloudinaryUploadResponse = await uploadRes.json();

    setCloudinaryPath(data.secure_url);
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
            <Card.Actions style={{ justifyContent: 'space-between' }}>
              <Button
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
