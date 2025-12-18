import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import { Button, Card, HelperText, Text, TextInput } from 'react-native-paper';
import VisibilitySelector from '../../components/RadioGroup';
import { spacing } from '../../constants/Spacing';
import { typography } from '../../constants/Typography';
import type { CreateAlbumResponseBodyPost } from '../api/albums/index+api';
import type { UserResponseBodyGet } from '../api/user+api';

export default function PostMyAlbum() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const getUser = async () => {
        const userResponse: UserResponseBodyGet = await fetch('/api/user').then(
          (response) => response.json(),
        );
        if ('error' in userResponse) {
          router.replace('/(auth)/login?returnTo=/album/newAlbum');
          return;
        }
      };
      getUser().catch((error) => console.log(error));
    }, [router]),
  );

  return (
    <SafeAreaView style={{ flex: 1, padding: spacing.md }}>
      <Card>
        <Card.Title
          title="Create Album"
          titleStyle={typography.title}
          subtitle="Fill in the details"
        />
        <Card.Content>
          <TextInput
            label="Album title"
            value={title}
            onChangeText={(text) => setTitle(text)}
            style={{ marginBottom: spacing.md }}
          />
          <TextInput
            label="description"
            value={description}
            onChangeText={(text) => setDescription(text)}
            style={{ marginBottom: spacing.md }}
          />
          <TextInput
            label="location"
            value={location}
            onChangeText={(text) => setLocation(text)}
            style={{ marginBottom: spacing.md }}
          />
          <View>
            {/* radio button */}
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
            <Text>Cancel </Text>
          </Button>
          <Button
            mode="contained"
            onPress={async () => {
              const response = await fetch('/api/albums', {
                method: 'POST',
                body: JSON.stringify({
                  location: location,
                  visibilityName: visibility,
                  title: title,
                  description: description,
                }),
              });
              if (!response.ok) {
                let errorMessage = 'Error Create Album';
                const responseBody: CreateAlbumResponseBodyPost =
                  await response.json();
                if ('error' in responseBody) {
                  errorMessage = responseBody.error;
                }

                setIsError(true);
                setMessage(errorMessage);

                return;
              }

              const responseBody: CreateAlbumResponseBodyPost =
                await response.json();

              if ('error' in responseBody) {
                setIsError(true);
                setMessage(responseBody.error);
                return;
              }
              const newAlbumId = responseBody.album.id;

              setTitle('');
              setDescription('');
              setLocation('');
              setVisibility('');
              router.navigate({
                pathname: '/album/[albumId]',
                params: { albumId: newAlbumId.toString() },
              });
            }}
          >
            <Text>Ok</Text>
          </Button>
        </Card.Actions>
      </Card>
    </SafeAreaView>
  );
}
