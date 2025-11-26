import {
  Href,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import React, { useCallback } from 'react';
import { Alert, SafeAreaView } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { UserResponseBodyGet } from '../api/user+api';
import { LoginResponseBodyPost } from './api/login+api';

export default function Login() {
  const [isFocused, setIsFocused] = React.useState<string | undefined>();
  const [userEmail, setUserEmail] = React.useState('');
  const [userPassword, setUserPassword] = React.useState('');
  const { returnTo } = useLocalSearchParams<{ returnTo: string }>();

  useFocusEffect(
    useCallback(() => {
      async function getUser() {
        const response = await fetch('/');

        const responseBody: UserResponseBodyGet = await response.json();

        if ('username' in responseBody) {
          if (returnTo && typeof returnTo === 'string') {
            router.replace(returnTo as Href);
          }

          router.replace('/(tabs)/profile');
        }
      }

      getUser().catch((error) => {
        console.error(error);
      });
    }, [returnTo]),
  );

  return (
    <SafeAreaView>
      <TextInput
        mode="outlined"
        label="Email"
        value={userEmail}
        onChangeText={(value) => setUserEmail(value)}
        onFocus={() => setIsFocused('email')}
        onBlur={() => setIsFocused(undefined)}
        placeholder="example@sample.com"
        right={<TextInput.Affix text="/100" />}
      />
      <HelperText type="error" visible={false}>
        Email address is invalid!
      </HelperText>

      <TextInput
        label="Password"
        mode="outlined"
        secureTextEntry
        onFocus={() => setIsFocused('password')}
        onBlur={() => setIsFocused(undefined)}
        onChangeText={(value) => setUserPassword(value)}
        error={false}
        /* check  by login */
        right={<TextInput.Icon icon="eye" />}
      />
      <Button
        mode="contained"
        onPress={async () => {
          const response = await fetch('/api/login', {
            method: 'POST',
            body: JSON.stringify({ userEmail, userPassword }),
          });
          if (!response.ok) {
            let errorMessage = 'Error logging in';
            const responseBody: LoginResponseBodyPost = await response.json();
            if ('error' in responseBody) {
              errorMessage = responseBody.error;
            }

            Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
            return;
          }

          const responseBody: LoginResponseBodyPost = await response.json();

          if ('error' in responseBody) {
            Alert.alert('Error', responseBody.error, [{ text: 'OK' }]);
            return;
          }

          setUserEmail('');
          setUserPassword('');
          if (returnTo && typeof returnTo === 'string') {
            console.log('pressed');
            router.replace(returnTo as Href);
          } else {
            console.log('pressed');
            router.replace('/(tabs)/profile');
          }
        }}
      >
        Login
      </Button>
    </SafeAreaView>
  );
}
