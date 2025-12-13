import HeaderBackButton from '@/components/HeaderBackButton';
import { theme } from '@/constants/Theme';
import { Stack } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTitleStyle: {
            color: theme.colors.primary,
            fontSize: 16,
            fontWeight: '600',
          },
          headerTintColor: theme.colors.primary,
          headerShadowVisible: false,
          headerBackVisible: false,
          headerLeft: () => <HeaderBackButton />,
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        {/* Tabs */}
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        {/* Auth */}
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />

        {/* Modal / others */}
        <Stack.Screen
          name="album/newAlbum"
          options={{
            title: 'New Album',
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="photos/photo"
          options={{
            title: 'Photo',
          }}
        />
        <Stack.Screen
          name="album/[albumId]"
          options={{
            title: 'Album',
          }}
        />
        <Stack.Screen
          name="photos/[photoId]"
          options={{
            title: 'Photo',
          }}
        />
      </Stack>
    </PaperProvider>
  );
}
