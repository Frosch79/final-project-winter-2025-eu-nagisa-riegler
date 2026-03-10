/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
      navigate: mockNavigate,
      push: mockPush,
    });

    (useFocusEffect as jest.Mock).mockImplementation((callback: any) => {
      useEffect(callback, []);
    });
    jest.clearAllMocks();
  });

  test('redirects to login when /api/user returns error', async () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: async () => ({ error: 'Not logged in' }),
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
    (global.fetch as jest.Mock).mockImplementation((url: any) => {
      if (url === '/api/user') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: mockFullUser }),
        });
      }

      if (url.includes('/api/feed')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ album: mockFeedMyAlbums }),
        });
      }

      if (url.includes('/api/follower')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: followersOfUser1 }),
        });
      }

      if (url.includes('/api/followed')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: followedByUser1 }),
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
    (global.fetch as jest.Mock).mockImplementation((url: any) => {
      if (url === '/api/user') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: mockFullUser }),
        });
      }

      if (url.includes('/api/feed')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ album: mockFeedMyAlbums }),
        });
      }

      if (url.includes('/api/follower')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ error: 'Follower error' }),
        });
      }

      if (url.includes('/api/followed')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: followedByUser1 }),
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
    (global.fetch as jest.Mock).mockImplementation((url: any) => {
      if (url === '/api/user') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: mockFullUser }),
        });
      }

      if (url.includes('/api/feed')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ album: [] }),
        });
      }

      if (url.includes('/api/follower')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: [] }),
        });
      }

      if (url.includes('/api/followed')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: [] }),
        });
      }

      if (url === '/api/logout') {
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
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

    (global.fetch as jest.Mock).mockImplementation((url: any) => {
      if (url === '/api/user') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: mockFullUser }),
        });
      }

      if (url.includes('/api/feed')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ album: [] }),
        });
      }

      if (url.includes('/api/follower')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: [] }),
        });
      }

      if (url.includes('/api/followed')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: [] }),
        });
      }

      if (url === '/api/logout') {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Logout failed' }),
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
