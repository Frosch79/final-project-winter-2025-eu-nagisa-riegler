import { jest } from '@jest/globals';
import { useEffect } from 'react';

const effectCall = (cb: any) =>
  useEffect(() => {
    cb();
  }, []);
// console warn ignore
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  (console.warn as jest.Mock).mockRestore();
});

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
  })),
  useNavigation: jest.fn(),
  useLocalSearchParams: jest.fn(() => ({})),
  useFocusEffect: (cb: any) => {
    effectCall(cb);
  },
}));

jest.mock('react-native-gesture-handler', () => {
  return {
    Swipeable: jest.fn(),
    DrawerLayout: jest.fn(),
  };
});

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  } as Response),
);

jest.mock('@expo/vector-icons', () => {
  return {
    __esModule: true,
    default: 'Icon',
  };
});

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
}));
