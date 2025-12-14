import {
  type Href,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { spacing } from '../../constants/Spacing';
import type { UserResponseBodyGet } from '../api/user+api';
import type { LoginResponseBodyPost } from './api/login+api';

export default function Login() {
  const [isFocused, setIsFocused] = useState<string | undefined>();
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const { returnTo } = useLocalSearchParams<{ returnTo: string }>();

  useFocusEffect(
    useCallback(() => {
      async function getUser() {
        const response = await fetch('/api/user');

        const responseBody: UserResponseBodyGet = await response.json();

        if ('username' in responseBody) {
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

  return (
    <SafeAreaView>
      <View>
        <TextInput
          mode="outlined"
          label="Email"
          value={userEmail}
          style={{ marginBottom: spacing.md }}
          onChangeText={(value) => setUserEmail(value)}
          onFocus={() => setIsFocused('email')}
          onBlur={() => setIsFocused(undefined)}
          placeholder="example@sample.com"
          right={<TextInput.Affix text="/100" />}
          keyboardType="email-address"
        />

        <TextInput
          label="Password"
          mode="outlined"
          secureTextEntry
          style={{ marginBottom: spacing.md }}
          onFocus={() => setIsFocused('password')}
          onBlur={() => setIsFocused(undefined)}
          onChangeText={(value) => setUserPassword(value)}
          right={<TextInput.Icon icon="eye" />}
        />
        <HelperText type="error" visible={isError}>
          {errorMessage}
        </HelperText>
      </View>

      <Button
        mode="outlined"
        onPress={async () => {
          const response = await fetch('/api/login', {
            method: 'POST',
            body: JSON.stringify({ email: userEmail, password: userPassword }),
          });

          if (!response.ok) {
            let errorMessage = 'Error logging in';
            const responseBody: LoginResponseBodyPost = await response.json();
            if ('error' in responseBody) {
              errorMessage = responseBody.error;
            }
            setIsError(true);
            setErrorMessage(errorMessage);

            return;
          }

          const responseBody: LoginResponseBodyPost = await response.json();

          if ('error' in responseBody) {
            setIsError(true);
            setErrorMessage('Email or password not valid');
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
        Login
      </Button>
      <Text>if you don't have an account</Text>
      <Button
        mode="outlined"
        onPress={() => router.replace('/(auth)/register')}
      >
        register
      </Button>
    </SafeAreaView>
  );
}
