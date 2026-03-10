import dayjs from 'dayjs';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { spacing } from '../../constants/Spacing';
import { type RegisterResponseBodyPost } from './api/register+api';

export default function Register() {
  const [userName, setUserName] = useState('');
  const [userBirthday, setUserBirthday] = useState('');
  const [userCountry, setUserCountry] = useState('');
  const [userDescription, setUserDescription] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [userPasswordConfirm, setUserPasswordConfirm] = useState('');

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      async function getUser() {
        const response = await fetch('/api/user');

        const responseBody: RegisterResponseBodyPost = await response.json();

        if ('user' in responseBody) {
          router.replace('/(tabs)/(user)/user');
        }
      }
      getUser().catch((error) => console.error(error));
    }, [router]),
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
        testID="input-username"
        maxLength={inputMaxLength.name}
        mode="outlined"
        label="username"
        value={userName}
        onChangeText={(value) => setUserName(value)}
        placeholder="username"
        style={{ marginBottom: spacing.md }}
        right={<TextInput.Affix text={`/${inputMaxLength.name}`} />}
      />

      <TextInput
        testID="input-birthday"
        mode="outlined"
        label="birthday"
        value={userBirthday}
        onChangeText={(value) => setUserBirthday(value)}
        placeholder="YYYY-MM-DD"
        keyboardType="number-pad"
        style={{ marginBottom: spacing.md }}
      />
      <TextInput
        testID="input-country"
        maxLength={inputMaxLength.country}
        mode="outlined"
        label="country"
        value={userCountry}
        onChangeText={(value) => setUserCountry(value)}
        placeholder="country"
        style={{ marginBottom: spacing.md }}
        right={<TextInput.Affix text={`/${inputMaxLength.country}`} />}
      />
      <TextInput
        testID="input-description"
        maxLength={inputMaxLength.description}
        mode="outlined"
        label="description"
        value={userDescription}
        onChangeText={(value) => setUserDescription(value)}
        placeholder="description"
        style={{ marginBottom: spacing.md }}
        right={<TextInput.Affix text={`/${inputMaxLength.description}`} />}
      />
      <TextInput
        testID="input-email"
        maxLength={inputMaxLength.email}
        mode="outlined"
        label="Email"
        value={userEmail}
        onChangeText={(value) => setUserEmail(value)}
        placeholder="example@sample.com"
        keyboardType="email-address"
        style={{ marginBottom: spacing.md }}
        right={<TextInput.Affix text={`/${inputMaxLength.email}`} />}
      />
      <TextInput
        testID="input-password"
        label="Password"
        mode="outlined"
        secureTextEntry
        onChangeText={(value) => {
          setUserPassword(value);
          if (value.length < 8) {
            setMessage('Password must be at least 8 characters');
          } else {
            setMessage('');
          }
        }}
        error={false}
        style={{ marginBottom: spacing.md }}
        /* check  by login */
        right={<TextInput.Icon icon="eye" />}
      />
      <TextInput
        testID="input-confirm-password"
        label="Password"
        mode="outlined"
        secureTextEntry
        value={userPasswordConfirm}
        onChangeText={(value) => setUserPasswordConfirm(value)}
        error={userPassword === userPasswordConfirm ? false : true}
        style={{ marginBottom: spacing.md }}
        right={<TextInput.Icon icon="eye" />}
      />

      <HelperText type="error" visible={isError}>
        {message}
      </HelperText>

      <Button
        testID="register"
        mode="outlined"
        disabled={
          !userName ||
          !userBirthday ||
          !userEmail ||
          !userPassword ||
          userPassword !== userPasswordConfirm
        }
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
            setMessage(errorMessage);

            return;
          }

          const responseBody: RegisterResponseBodyPost = await response.json();

          if ('error' in responseBody) {
            setIsError(true);
            setMessage(responseBody.error);

            return;
          }

          setUserEmail('');
          setUserPassword('');

          router.replace('/(tabs)/(user)/user');
        }}
      >
        <Text>register</Text>
      </Button>

      <Text>if you already have an account</Text>
      <Button
        testID="login-page"
        mode="outlined"
        onPress={() => router.replace('/(auth)/login')}
      >
        <Text>login</Text>
      </Button>
    </SafeAreaView>
  );
}
