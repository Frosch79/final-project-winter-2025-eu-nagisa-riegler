import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import UserPage from '../(tabs)/(user)/user';
import { mockNavigate, mockPush, mockReplace } from '../../jest.setup';
import { paperMock } from '../../util/__tests__/__mock__/paperMock';
import { mockFeedMyAlbums } from '../../util/__tests__/__mock__/testAlbumFeed';
import {
  followedByUser1,
  followersOfUser1,
} from '../../util/__tests__/__mock__/testFollows';
import { mockFullUser } from '../../util/__tests__/__mock__/testUser';

paperMock();

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
  useRouter: jest.fn(),
}));

describe('UserPage screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
      navigate: mockNavigate,
      push: mockPush,
    });
    (useFocusEffect as jest.Mock).mockImplementation((callback: unknown) => {
      useEffect(() => {
        if (typeof callback === 'function') {
          (callback as () => void)();
        }
      }, [callback]);
    });
  });

  test('redirects to login when /api/user returns error', async () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Not logged in' }),
      } as Response),
    );

    render(<UserPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        '/(auth)/login?returnTo=/(tabs)/(user)/user',
      );
    });
  });

  test('renders user and albums when API succeeds', async () => {
    (global.fetch as jest.Mock).mockImplementation((input: unknown) => {
      const url = typeof input === 'string' ? input : '';
      if (url === '/api/user') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: mockFullUser }),
        });
      }

      if (url.includes('/api/feed')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ album: mockFeedMyAlbums }),
        });
      }

      if (url.includes('/api/follower')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: followersOfUser1 }),
        });
      }

      if (url.includes('/api/followed')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: followedByUser1 }),
        });
      }
    });

    const { getAllByText, getByText } = render(<UserPage />);
    await waitFor(() => {
      const names = getAllByText(mockFullUser.name);

      expect(names.length).toBeGreaterThan(0);
      mockFeedMyAlbums.forEach((album) => {
        expect(getByText(album.title)).toBeTruthy();
      });
    });
  });

  test('shows error message when follower API fails', async () => {
    (global.fetch as jest.Mock).mockImplementation((input: unknown) => {
      const url = typeof input === 'string' ? input : '';
      if (url === '/api/user') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: mockFullUser }),
        });
      }

      if (url.includes('/api/feed')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ album: mockFeedMyAlbums }),
        });
      }

      if (url.includes('/api/follower')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ error: 'Follower error' }),
        });
      }

      if (url.includes('/api/followed')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: followedByUser1 }),
        });
      }
    });

    const { findByText } = render(<UserPage />);
    await waitFor(() => {
      const name = findByText(mockFullUser.name);

      expect(name).toBeTruthy();
    });
  });

  test('calls router.push on logout success', async () => {
    (global.fetch as jest.Mock).mockImplementation((input: unknown) => {
      const url = typeof input === 'string' ? input : '';
      if (url === '/api/user') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: mockFullUser }),
        });
      }

      if (url.includes('/api/feed')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ album: [] }),
        });
      }

      if (url.includes('/api/follower')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: [] }),
        });
      }

      if (url.includes('/api/followed')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: [] }),
        });
      }

      if (url === '/api/logout') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      }

      throw new Error(`Unhandled URL: ${url}`);
    });
    const { getByTestId, findByText } = render(<UserPage />);
    await waitFor(() => {
      expect(findByText(mockFullUser.name)).toBeTruthy();
    });
    fireEvent.press(getByTestId('logout-button'));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/(auth)/login');
    });
  });

  test('shows alert on logout failure', async () => {
    const alertMock = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    (global.fetch as jest.Mock).mockImplementation((input: unknown) => {
      const url = typeof input === 'string' ? input : '';
      if (url === '/api/user') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: mockFullUser }),
        });
      }

      if (url.includes('/api/feed')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ album: [] }),
        });
      }

      if (url.includes('/api/follower')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: [] }),
        });
      }

      if (url.includes('/api/followed')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: [] }),
        });
      }

      if (url === '/api/logout') {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Logout failed' }),
        });
      }

      throw new Error(`Unhandled URL: ${url}`);
    });

    const { getByTestId, findByText } = render(<UserPage />);
    await waitFor(() => {
      expect(findByText(mockFullUser.name)).toBeTruthy();
    });
    fireEvent.press(getByTestId('logout-button'));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalled();
    });

    alertMock.mockRestore();
  });
});
