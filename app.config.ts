import { type ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'expo-example-winter-2025-eu-nagisa-riegler',
  slug: 'expo-example-winter-2025-eu-nagisa-riegler',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon-shutter.png',
  scheme: 'myapp',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
  },
  android: {
    package: 'com.frosch79.expoexamplewinter2025eunagisariegler',
    adaptiveIcon: {
      foregroundImage: './assets/images/icon-shutter.png',
      backgroundColor: '#ffffff',
    },
  },
  web: {
    bundler: 'metro',
    output: 'server',
    favicon: './assets/images/icon-shutter.png',
  },
  plugins: [
    [
      'expo-router',
      /*  {
        origin: 'https://final-project-winter-2025-eu-nagisa.vercel.app/',
      }, */
    ],

    [
      'expo-splash-screen',
      {
        image: './assets/images/icon-shutter.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],

    [
      'expo-build-properties',
      {
        android: {
          usesCleartextTraffic: true,
        },
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'The app accesses your photos to let you share them with your friends.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },

  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: '759f7d5c-73ec-4db4-af36-651c8829c353',
    },
  },
};

export default config;
