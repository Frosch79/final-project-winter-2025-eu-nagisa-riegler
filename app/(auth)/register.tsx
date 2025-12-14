import dayjs from 'dayjs';
import {
  type Href,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { spacing } from '../../constants/Spacing';
import { type RegisterResponseBodyPost } from './api/register+api';

export default function Register() {
  const [isFocused, setIsFocused] = useState<string | undefined>();
  const [userName, setUserName] = useState('');
  const [userBirthday, setUserBirthday] = useState('');
  const [userCountry, setUserCountry] = useState('');
  const [userDescription, setUserDescription] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [userPasswordConfirm, setUserPasswordConfirm] = useState('');

  const { returnTo } = useLocalSearchParams<{ returnTo: string }>();

  useFocusEffect(
    useCallback(() => {
      async function getUser() {
        const response = await fetch('/api/user');

        const responseBody: RegisterResponseBodyPost = await response.json();

        if ('user' in responseBody) {
          if (returnTo && typeof returnTo === 'string') {
            router.replace(returnTo as Href);
          }
          router.replace('/(tabs)/(user)/user');
        }
      }

      getUser().catch((error) => {
        console.error(error);
      });
    }, [returnTo]),
  );

  const inputMaxLength = {
    name: 100,
    country: 30,
    description: 500,
    email: 100,
  };

  return (
    <SafeAreaView>
      <TextInput
        maxLength={inputMaxLength.name}
        mode="outlined"
        label="username"
        value={userName}
        onChangeText={(value) => setUserName(value)}
        onFocus={() => setIsFocused('name')}
        onBlur={() => setIsFocused(undefined)}
        placeholder="username"
        style={{ marginBottom: spacing.md }}
        right={<TextInput.Affix text={`/${inputMaxLength.name}`} />}
      />

      <TextInput
        mode="outlined"
        label="birthday"
        value={userBirthday}
        onChangeText={(value) => setUserBirthday(value)}
        onFocus={() => setIsFocused('birthday')}
        onBlur={() => setIsFocused(undefined)}
        placeholder="YYYY-MM-DD"
        keyboardType="number-pad"
        style={{ marginBottom: spacing.md }}
      />
      <TextInput
        maxLength={inputMaxLength.country}
        mode="outlined"
        label="country"
        value={userCountry}
        onChangeText={(value) => setUserCountry(value)}
        onFocus={() => setIsFocused('country')}
        onBlur={() => setIsFocused(undefined)}
        placeholder="country"
        style={{ marginBottom: spacing.md }}
        right={<TextInput.Affix text={`/${inputMaxLength.country}`} />}
      />
      <TextInput
        maxLength={inputMaxLength.description}
        mode="outlined"
        label="description"
        value={userDescription}
        onChangeText={(value) => setUserDescription(value)}
        onFocus={() => setIsFocused('description')}
        onBlur={() => setIsFocused(undefined)}
        placeholder="description"
        style={{ marginBottom: spacing.md }}
        right={<TextInput.Affix text={`/${inputMaxLength.description}`} />}
      />
      <TextInput
        maxLength={inputMaxLength.email}
        mode="outlined"
        label="Email"
        value={userEmail}
        onChangeText={(value) => setUserEmail(value)}
        onFocus={() => setIsFocused('email')}
        onBlur={() => setIsFocused(undefined)}
        placeholder="example@sample.com"
        keyboardType="email-address"
        style={{ marginBottom: spacing.md }}
        right={<TextInput.Affix text={`/${inputMaxLength.email}`} />}
      />
      <TextInput
        label="Password"
        mode="outlined"
        secureTextEntry
        onFocus={() => setIsFocused('password')}
        onBlur={() => setIsFocused(undefined)}
        onChangeText={(value) => setUserPassword(value)}
        error={false}
        style={{ marginBottom: spacing.md }}
        /* check  by login */
        right={<TextInput.Icon icon="eye" />}
      />
      <TextInput
        label="Password"
        mode="outlined"
        secureTextEntry
        onFocus={() => setIsFocused('password')}
        onBlur={() => setIsFocused(undefined)}
        value={userPasswordConfirm}
        onChangeText={(value) => setUserPasswordConfirm(value)}
        error={userPassword === userPasswordConfirm ? false : true}
        style={{ marginBottom: spacing.md }}
        right={<TextInput.Icon icon="eye" />}
      />

      <HelperText type="error" visible={isError}>
        {errorMessage}
      </HelperText>

      <Button
        mode="outlined"
        onPress={async () => {
          const response = await fetch('/api/register', {
            method: 'POST',
            body: JSON.stringify({
              name: userName,
              birthday: dayjs(userBirthday).format('YYYY-MM-DD'),
              country: userCountry,
              accountDescription: userDescription,
              email: userEmail,
              password: userPasswordConfirm,
            }),
          });
          if (!response.ok) {
            let errorMessage = 'Error Register';
            const responseBody: RegisterResponseBodyPost =
              await response.json();
            if ('error' in responseBody) {
              errorMessage = responseBody.error;
            }
            setIsError(true);
            setErrorMessage(errorMessage);

            return;
          }

          const responseBody: RegisterResponseBodyPost = await response.json();

          if ('error' in responseBody) {
            setIsError(true);
            setErrorMessage(errorMessage);
            return;
          }

          setUserEmail('');
          setUserPassword('');
          if (returnTo && typeof returnTo === 'string') {
            router.replace(returnTo as Href);
          } else {
            router.replace('/(tabs)/(user)/user');
          }
        }}
      >
        register
      </Button>

      <Text>if you already have an account</Text>
      <Button mode="outlined" onPress={() => router.replace('/(auth)/login')}>
        login
      </Button>
    </SafeAreaView>
  );
}
