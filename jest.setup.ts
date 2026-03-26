import { jest } from '@jest/globals';
import { useEffect } from 'react';

// console warn ignore
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  (console.warn as jest.Mock).mockRestore();
});

export const useEffectCall = (cb: () => void | (() => void)) =>
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

  useLocalSearchParams: jest.fn(),

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

(global as unknown as Record<string, unknown>).setImmediate = (
  callback: (...args: unknown[]) => void,
  ...args: any[]
) => {
  return setTimeout(callback, 0, ...args);
};

jest.mock('react-native', () => {
  const reactNative =
    jest.requireActual<Record<string, unknown>>('react-native');

  const mockAnimation = () => ({
    start: (callback?: (result: { finished: boolean }) => void) => {
      callback?.({ finished: true });
    },
    stop: () => {
      /* do nothing */
    },
  });

  const animated = reactNative.Animated as Record<string, unknown>;

  animated.timing = mockAnimation;
  animated.spring = mockAnimation;
  animated.parallel = mockAnimation;
  animated.sequence = mockAnimation;

  return reactNative;
});

const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('not wrapped in act')) {
    return;
  }
  originalError(...args);
};
