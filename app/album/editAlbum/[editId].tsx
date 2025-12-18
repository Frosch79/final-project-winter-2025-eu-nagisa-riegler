import { useFocusEffect } from 'expo-router';
import { useLocalSearchParams, useRouter } from 'expo-router/build/hooks';
import { useCallback, useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import { Button, Card, HelperText, TextInput } from 'react-native-paper';
import VisibilitySelector from '../../../components/RadioGroup';
import { spacing } from '../../../constants/Spacing';
import { typography } from '../../../constants/Typography';
import type {
  AlbumResponseBodyDelete,
  AlbumResponseBodyGet,
  AlbumResponseBodyPut,
} from '../../api/albums/[albumId]+api';
import type { UserResponseBodyGet } from '../../api/user+api';

export default function EditAlbum() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState('');
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState('');
  const { editId } = useLocalSearchParams<{ editId: string }>();

  const router = useRouter();
  useFocusEffect(
    useCallback(() => {
      const getUser = async () => {
        const [userResponse, albumResponse]: [
          UserResponseBodyGet,
          AlbumResponseBodyGet,
        ] = await Promise.all([
          fetch('/api/user').then((response) => response.json()),
          fetch(`/api/albums/${editId}`).then((response) => response.json()),
        ]);
        if ('error' in userResponse) {
          router.replace('/(auth)/login?returnTo=/album/editAlbum/[editId]');
          return;
        }

        if ('error' in albumResponse) {
          return;
        }
        if ('album' in albumResponse) {
          const albumData = albumResponse.album;
          setTitle(albumData.title);
          setLocation(albumData.location || '');
          setDescription(albumData.description || '');
          setVisibility(albumData.visibilityName);
        }
      };
      getUser().catch((error) => console.log(error));
    }, [editId, router]),
  );

  return (
    <SafeAreaView style={{ flex: 1, padding: spacing.md }}>
      <Card mode="outlined">
        <Card.Title
          title="Edit Album"
          titleStyle={typography.title}
          subtitle="Update album details"
        />
        <Card.Content>
          <TextInput
            label="Album title"
            value={title}
            onChangeText={(text) => setTitle(text)}
            mode="outlined"
            style={{ marginBottom: spacing.md }}
          />
          <TextInput
            label="description"
            value={description}
            onChangeText={(text) => setDescription(text)}
            mode="outlined"
            style={{ marginBottom: spacing.md }}
          />
          <TextInput
            label="location"
            value={location}
            onChangeText={(text) => setLocation(text)}
            mode="outlined"
            style={{ marginBottom: spacing.md }}
          />
          <View>
            <VisibilitySelector value={visibility} onChange={setVisibility} />
          </View>
        </Card.Content>
        <HelperText type="error" visible={isError}>
          {message}
        </HelperText>
        <Card.Actions>
          <Button
            mode="text"
            onPress={() => router.replace('/(tabs)/(user)/user')}
          >
            Cancel
          </Button>
          <Button
            mode="elevated"
            onPress={async () => {
              const response = await fetch(`/api/albums/${editId}`, {
                method: 'DELETE',
              });
              if (!response.ok) {
                let errorMessage = 'Error Delete Album';
                const responseBody: AlbumResponseBodyDelete =
                  await response.json();
                if ('error' in responseBody) {
                  errorMessage = responseBody.error;
                }

                setIsError(true);
                setMessage(errorMessage);

                return;
              }

              const responseBody: AlbumResponseBodyDelete =
                await response.json();

              if ('error' in responseBody) {
                setIsError(true);
                setMessage(responseBody.error);
                return;
              }

              router.replace('/(tabs)/(user)/user');
            }}
          >
            DELETE
          </Button>
          <Button
            mode="contained"
            onPress={async () => {
              if (!title || title === '') {
                setIsError(true);
                setMessage('Please write a title');
                return;
              }
              const response = await fetch(`/api/albums/${editId}`, {
                method: 'PUT',
                body: JSON.stringify({
                  location: location,
                  visibilityName: visibility,
                  title: title,
                  description: description,
                }),
              });
              if (!response.ok) {
                let errorMessage = 'Error Create Album';
                const responseBody: AlbumResponseBodyPut =
                  await response.json();
                if ('error' in responseBody) {
                  errorMessage = responseBody.error;
                }

                setIsError(true);
                setMessage(errorMessage);

                return;
              }

              const responseBody: AlbumResponseBodyPut = await response.json();

              if ('error' in responseBody) {
                setIsError(true);
                setMessage(responseBody.error);
                return;
              }
              const albumId = responseBody.album.id;
              setTitle('');
              setDescription('');
              setLocation('');
              setVisibility('');
              router.replace({
                pathname: '/album/[albumId]',
                params: { albumId: albumId.toString() },
              });
            }}
          >
            EDIT
          </Button>
        </Card.Actions>
      </Card>
    </SafeAreaView>
  );
}
