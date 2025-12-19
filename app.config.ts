import { type ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'final-project-winter-2025-eu-nagisa-riegler',
  slug: 'final-project-winter-2025-eu-nagisa-riegler',
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
    package: 'com.final_projectwinter_2025_eu_nagisa_riegler',
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
      {
        origin: 'https://final-project-winter-2025-eu-nagisa.vercel.app/',
      },
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
    eas: {
      projectId: 'e2cda16f-21b8-40e6-83bb-58958c5867ca',
    },
  },
};

export default config;
