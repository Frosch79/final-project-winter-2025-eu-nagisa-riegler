import { render, waitFor } from '@testing-library/react-native';
import { View } from 'react-native';
import Index from '../index';

// __tests__/mocks/expo-router.ts
export const mockRedirect = jest.fn(({ href }: { href: string }) => {
  return <View testID="redirect">{href}</View>;
});

jest.mock('expo-router', () => ({
  __esModule: true,
  Redirect: mockRedirect,
  useFocusEffect: (fn: () => void) => fn(),
}));

describe('Index Page', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('redirects to user page when logged in', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 1, name: 'Alice' }),
      } as Response),
    );

    const { getByTestId } = render(<Index />);

    await waitFor(() => {
      expect(getByTestId('redirect').props.children).toBe(
        '/(tabs)/(user)/user',
      );
    });
  });

  test('redirects to login page when not logged in', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ error: 'Not logged in' }),
      } as Response),
    );

    const { getByTestId } = render(<Index />);

    await waitFor(() => {
      expect(getByTestId('redirect').props.children).toBe('/(auth)/login');
    });
  });

  test('handles fetch failure gracefully', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Network error')),
    ) as jest.Mock;

    const { getByTestId } = render(<Index />);

    await waitFor(() => {
      expect(getByTestId('redirect').props.children).toBe('/(auth)/login');
    });
  });
});
