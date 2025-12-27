import { jest } from '@jest/globals';
import { useEffect } from 'react';

// console warn ignore
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  (console.warn as jest.Mock).mockRestore();
});

const useEffectCall = (cb: () => void | (() => void)) =>
  useEffect(() => {
    return cb();
  }, [cb]);
export const mockNavigate = jest.fn();
export const mockPush = jest.fn();
export const mockReplace = jest.fn();
export const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    navigate: mockNavigate,
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
  })),

  useNavigation: jest.fn(),
  useLocalSearchParams: jest.fn(() => ({})),
  useFocusEffect: (cb: any) => {
    useEffectCall(cb);
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

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
(global as any).setImmediate = setTimeout;

jest.useFakeTimers();
