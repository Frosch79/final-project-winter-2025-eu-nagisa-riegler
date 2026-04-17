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
    (global.fetch as jest.Mock).mockImplementation((input: unknown) => {
      const url = typeof input === 'string' ? input : '';
      if (url === '/api/user') {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Not logged in' }),
        });
      }

      if (url.includes('/api/feed')) {
        return Promise.resolve({
          json: () => Promise.resolve({}),
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
    (global.fetch as jest.Mock).mockImplementation((input: unknown) => {
      const url = typeof input === 'string' ? input : '';
      if (url === '/api/user') {
        return Promise.resolve({
          json: () => Promise.resolve({ user: { id: 1 } }),
        });
      }

      if (url.includes('/api/feed?visibility=followersOnly')) {
        return Promise.resolve({
          json: () => Promise.resolve({ feedAlbum: otherUserAlbums }),
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
    (global.fetch as jest.Mock).mockImplementation((input: unknown) => {
      const url = typeof input === 'string' ? input : '';
      if (url === '/api/user') {
        return Promise.resolve({
          json: () => Promise.resolve({ user: { id: 1 } }),
        });
      }

      // followersOnly feed
      if (url.includes('/api/feed?visibility=followersOnly')) {
        return Promise.resolve({
          json: () => Promise.resolve({ feedAlbum: otherUserAlbums }),
        });
      }

      // public feed
      if (url.includes('/api/feed?visibility=public')) {
        return Promise.resolve({
          json: () => Promise.resolve({ feedAlbum: otherUserAlbums }),
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
    (global.fetch as jest.Mock).mockImplementation((input: unknown) => {
      const url = typeof input === 'string' ? input : '';
      if (url === '/api/user') {
        return Promise.resolve({
          json: () => Promise.resolve({ user: { id: 1 } }),
        });
      }

      if (url.includes('/api/feed?visibility=followersOnly')) {
        return Promise.resolve({
          json: () => Promise.resolve({ error: 'Feed error' }),
        });
      }
    });

    const { getByText } = render(<Feed />);

    await waitFor(() => {
      expect(getByText('No Albums')).toBeTruthy();
    });
  });

  test('shows "No Albums" when feed is empty', async () => {
    (global.fetch as jest.Mock).mockImplementation((input: unknown) => {
      const url = typeof input === 'string' ? input : '';
      if (url === '/api/user') {
        return Promise.resolve({
          json: () => Promise.resolve({ user: { id: 1 } }),
        });
      }

      if (url.includes('/api/feed?visibility=followersOnly')) {
        return Promise.resolve({
          json: () => Promise.resolve({ feedAlbum: [] }),
        });
      }
    });

    const { getByText } = render(<Feed />);

    await waitFor(() => {
      expect(getByText('No Albums')).toBeTruthy();
    });
  });
});
