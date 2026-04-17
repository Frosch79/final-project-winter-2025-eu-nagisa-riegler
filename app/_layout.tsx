import { Stack } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { Provider as PaperProvider, Text } from 'react-native-paper';
import HeaderBackButton from '../components/HeaderBackButton';
import { theme } from '../constants/Theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#072623',
  },
  header: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#234620',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  outerContainer: {
    flex: 1,

    backgroundColor: '#fffff',
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    // Web
    ...Platform.select({
      web: {
        maxWidth: 600,
        alignSelf: 'center',
        // shadow for web ver.
        boxShadow: '0 0 20px rgba(0,0,0,0.5)',
      },
    }),
  },
});

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <View style={styles.outerContainer}>
        <View style={styles.innerContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>PixVault</Text>
          </View>
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
                title: 'Create Album',
                headerShown: false,
              }}
            />

            <Stack.Screen
              name="photos/photo"
              options={{
                title: 'Create Photo',
                headerLeft: () => '',
              }}
            />
            <Stack.Screen
              name="album/[albumId]"
              options={{
                title: 'Album',
                headerShown: true,
                headerLeft: () => '',
              }}
            />
            <Stack.Screen
              name="photos/[photoId]"
              options={{
                title: 'Photo',
              }}
            />
          </Stack>
        </View>
      </View>
    </PaperProvider>
  );
}
