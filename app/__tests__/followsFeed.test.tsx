/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { render, waitFor } from '@testing-library/react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useEffect } from 'react';
import Feed from '../(tabs)/(feeds)/followsFeed';
import { mockNavigate, mockPush, mockReplace } from '../../jest.setup';
import { otherUserAlbums } from '../../util/__tests__/__mock__/testAlbumFeed';

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
  useRouter: jest.fn(),
}));

describe('Follows Feed screen', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
      navigate: mockNavigate,
      push: mockPush,
    });

    // useFocusEffect 内の callback を即時実行
    (useFocusEffect as jest.Mock).mockImplementation((callback: any) => {
      useEffect(callback, []);
    });

    jest.clearAllMocks();
  });

  test('redirects to login when /api/user returns error', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: any) => {
      if (url === '/api/user') {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Not logged in' }),
        });
      }

      if (url.includes('/api/feed')) {
        return Promise.resolve({
          json: async () => ({}),
        });
      }
    });

    render(<Feed />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        '/(auth)/login?returnTo=/(tabs)/(feeds)followsFeed',
      );
    });
  });

  test('renders follows feed albums when API succeeds', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: any) => {
      if (url === '/api/user') {
        return Promise.resolve({
          json: async () => ({ user: { id: 1 } }),
        });
      }

      if (url.includes('/api/feed?visibility=followersOnly')) {
        return Promise.resolve({
          json: async () => ({ feedAlbum: otherUserAlbums }),
        });
      }
    });

    const { getByText } = render(<Feed />);

    await waitFor(() => {
      otherUserAlbums.forEach((album) => {
        expect(getByText(album.title)).toBeTruthy();
      });
    });
  });

  test('renders combined feed (public + follows + user) when API succeeds', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: any) => {
      if (url === '/api/user') {
        return Promise.resolve({
          json: async () => ({ user: { id: 1 } }),
        });
      }

      // followersOnly feed
      if (url.includes('/api/feed?visibility=followersOnly')) {
        return Promise.resolve({
          json: async () => ({ feedAlbum: otherUserAlbums }),
        });
      }

      // public feed (別テストで混ぜる想定)
      if (url.includes('/api/feed?visibility=public')) {
        return Promise.resolve({
          json: async () => ({ feedAlbum: otherUserAlbums }),
        });
      }
    });

    const { getByText } = render(<Feed />);

    await waitFor(() => {
      otherUserAlbums.forEach((album) => {
        expect(getByText(album.title)).toBeTruthy();
      });
    });
  });

  test('shows "No Albums" when feed API returns error', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: any) => {
      if (url === '/api/user') {
        return Promise.resolve({
          json: async () => ({ user: { id: 1 } }),
        });
      }

      if (url.includes('/api/feed?visibility=followersOnly')) {
        return Promise.resolve({
          json: async () => ({ error: 'Feed error' }),
        });
      }
    });

    const { getByText } = render(<Feed />);

    await waitFor(() => {
      expect(getByText('No Albums')).toBeTruthy();
    });
  });

  test('shows "No Albums" when feed is empty', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: any) => {
      if (url === '/api/user') {
        return Promise.resolve({
          json: async () => ({ user: { id: 1 } }),
        });
      }

      if (url.includes('/api/feed?visibility=followersOnly')) {
        return Promise.resolve({
          json: async () => ({ feedAlbum: [] }),
        });
      }
    });

    const { getByText } = render(<Feed />);

    await waitFor(() => {
      expect(getByText('No Albums')).toBeTruthy();
    });
  });
});
