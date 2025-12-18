import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { Button, Card, HelperText, TextInput } from 'react-native-paper';
import { spacing } from '../../../../constants/Spacing';
import { typography } from '../../../../constants/Typography';
import { FullUser } from '../../../../database/users';
import {
  UserResponseBodyGet,
  UserResponseBodyPut,
} from '../../../api/user+api';

export default function EditAccount() {
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState('');
  const [name, setName] = useState<FullUser['name']>();
  const [country, setCountry] = useState<FullUser['country']>();
  const [description, setDescription] =
    useState<FullUser['accountDescription']>();
  const router = useRouter();
  useFocusEffect(
    useCallback(() => {
      const getEditUser = async () => {
        const editUserResponse: UserResponseBodyGet = await fetch(
          `/api/user/`,
        ).then((response) => response.json());
        if ('error' in editUserResponse) {
          router.replace(
            `/(auth)/login?returnTo=/(tabs)/(user)/(editAccount)/editAccount`,
          );
          return;
        }
        if ('user' in editUserResponse) {
          const currentUser = editUserResponse.user;
          setCountry(currentUser.country);
          setDescription(currentUser.accountDescription);
          setName(currentUser.name);
        }
      };
      getEditUser().catch((error) => console.log(error));
    }, [router]),
  );
  return (
    <SafeAreaView style={{ flex: 1, padding: spacing.md }}>
      <Card mode="outlined">
        <Card.Title
          title="Edit Account"
          titleStyle={typography.title}
          subtitle="Update account details"
        />
        <Card.Content>
          <TextInput
            label="Username"
            value={name}
            onChangeText={(text) => setName(text)}
            mode="outlined"
            style={{ marginBottom: spacing.md }}
          />
          <TextInput
            label="country"
            value={country}
            onChangeText={(text) => setCountry(text)}
            mode="outlined"
            style={{ marginBottom: spacing.md }}
          />
          <TextInput
            label="description"
            value={description || ''}
            onChangeText={(text) => setDescription(text)}
            mode="outlined"
            style={{ marginBottom: spacing.md }}
          />
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
            mode="contained"
            onPress={async () => {
              if (!name || name === '' || !country || country === '') {
                setIsError(true);
                setMessage('you have to fill name and country');
                return;
              }
              const response = await fetch(`/api/user/`, {
                method: 'PUT',
                body: JSON.stringify({
                  name: name,
                  country: country,
                  accountDescription: description,
                }),
              });
              if (!response.ok) {
                let errorMessage = 'Error Create Album';
                const responseBody: UserResponseBodyPut = await response.json();
                if ('error' in responseBody) {
                  errorMessage = responseBody.error;
                }

                setIsError(true);
                setMessage(errorMessage);

                return;
              }

              const responseBody: UserResponseBodyPut = await response.json();

              if ('error' in responseBody) {
                setIsError(true);
                setMessage(responseBody.error);
                return;
              }

              setName('');
              setDescription('');
              setCountry('');

              router.replace('/(tabs)/(user)/user');
            }}
          >
            EDIT
          </Button>
        </Card.Actions>
      </Card>
    </SafeAreaView>
  );
}
