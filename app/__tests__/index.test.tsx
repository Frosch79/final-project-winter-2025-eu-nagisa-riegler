import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { render, waitFor } from '@testing-library/react-native';
import { Redirect, useFocusEffect } from 'expo-router';
import Index from '../index';

jest.mock('expo-router', () => ({
  Redirect: jest.fn(),
  useFocusEffect: jest.fn(),
}));

describe('Index redirect test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('redirects to user page when logged in', async () => {
    // success fetch
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      json: () => ({ id: 1, name: 'test' }),
    } as any);

    // useFocusEffect
    (useFocusEffect as jest.Mock).mockImplementation((callback: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      callback();
    });

    render(<Index />);

    await waitFor(() => {
      const firstArg = (Redirect as jest.Mock).mock.calls[0];
      expect(firstArg).toEqual([
        {
          href: '/(tabs)/(user)/user',
        },
        {},
      ]);
    });

    expect(global.fetch).toHaveBeenCalledWith(`/api/user`);
  });

  test('redirects to login when not logged in', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      json: () => ({ error: 'User not found' }),
    } as any);

    (useFocusEffect as jest.Mock).mockImplementation((callback: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      callback();
    });

    render(<Index />);

    await waitFor(() => {
      const firstArg = (Redirect as jest.Mock).mock.calls[0];
      expect(firstArg).toEqual([
        {
          href: '/(auth)/login',
        },
        {},
      ]);
    });
  });
});
