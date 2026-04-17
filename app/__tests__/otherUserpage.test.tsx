import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import UserPage from '../(tabs)/(user)/[userId]';
import { mockNavigate, mockPush, mockReplace } from '../../jest.setup';
import { paperMock } from '../../util/__tests__/__mock__/paperMock';
import { otherUserAlbums } from '../../util/__tests__/__mock__/testAlbumFeed';
import {
  followedByUser1,
  followersOfUser1,
} from '../../util/__tests__/__mock__/testFollows';
import {
  mockFullUser,
  otherUser,
} from '../../util/__tests__/__mock__/testUser';

paperMock();

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

describe('OtherUserPage screen', () => {
  const otherUserId = otherUser.id;

  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      userId: otherUserId.toString(),
    });
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

  test('renders other user and albums when API succeeds', async () => {
    (global.fetch as jest.Mock).mockImplementation((input: unknown) => {
      const url = typeof input === 'string' ? input : '';
      if (url === '/api/user') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: mockFullUser }),
        });
      }

      if (url.includes(`/api/users`)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: otherUser }),
        });
      }

      if (url.includes(`/api/feed/`)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ album: otherUserAlbums }),
        });
      }

      if (url.includes(`/api/follower`)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: followedByUser1 }),
        });
      }

      if (url.includes(`/api/followed`)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: followersOfUser1 }),
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

    const { getAllByText, getByText, queryByText } = render(<UserPage />);
    await waitFor(() => {
      const names = getAllByText(otherUser.name);

      expect(names.length).toBeGreaterThan(0);
      otherUserAlbums.forEach((album) => {
        expect(getByText(album.title)).toBeTruthy();
      });
    });

    expect(queryByText('Edit')).toBeNull();
  });

  test('can follow and unfollow other user', async () => {
    let isFollowing = false;

    (global.fetch as jest.Mock).mockImplementation(
      (input: unknown, options?: unknown) => {
        const url = typeof input === 'string' ? input : '';

        const init = options as { method?: string } | undefined;
        if (url === '/api/user') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ user: mockFullUser }),
          });
        }

        if (url.includes(`/api/users/`)) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ user: otherUser }),
          });
        }

        if (url.includes(`/api/feed/`)) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ album: otherUserAlbums }),
          });
        }
        if (url === `/api/followed/${otherUserId}`) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ result: isFollowing }),
          });
        }
        if (url === `/api/follower?userId=${otherUserId}`) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ user: followedByUser1 }),
          });
        }
        if (url === `/api/followed?userId=${otherUserId}`) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ user: followersOfUser1 }),
          });
        }
        if (url === '/api/followed' && init?.method === 'POST') {
          isFollowing = true;
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                follow: {
                  id: 35,
                  followerUserId: 13,
                  followedUserId: 2,
                  createdDate: '2026-03-06T13:22:55.673Z',
                },
              }),
          });
        }

        if (url === '/api/followed' && init?.method === 'DELETE') {
          isFollowing = false;
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          });
        }

        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      },
    );

    const { getByText, getAllByText, getByTestId } = render(<UserPage />);

    await waitFor(() => {
      const names = getAllByText(otherUser.name);
      expect(names.length).toBeGreaterThan(0);

      otherUserAlbums.forEach((album) => {
        expect(getByText(album.title)).toBeTruthy();
      });
    });

    const followButton = getByTestId('follow-button');

    expect(getByText('Follow')).toBeTruthy();

    fireEvent.press(followButton);

    // Follow
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/followed',
        expect.objectContaining({
          method: 'POST',
        }),
      );

      expect(getByText('Followed')).toBeTruthy();
    });

    fireEvent.press(followButton);
    // UnFollow
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/followed',
        expect.objectContaining({
          method: 'DELETE',
        }),
      );

      expect(getByText('Follow')).toBeTruthy();
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

      if (url.includes(`/api/users`)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: otherUser }),
        });
      }

      if (url.includes(`/api/feed/`)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ album: otherUserAlbums }),
        });
      }

      if (url.includes(`/api/follower`)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: followedByUser1 }),
        });
      }

      if (url.includes(`/api/followed`)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: followersOfUser1 }),
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

    const { getByTestId, findByText, getAllByText, getByText } = render(
      <UserPage />,
    );
    await waitFor(() => {
      const names = getAllByText(otherUser.name);

      expect(names.length).toBeGreaterThan(0);
      otherUserAlbums.forEach((album) => {
        expect(getByText(album.title)).toBeTruthy();
      });
    });

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

      if (url.includes(`/api/users`)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: otherUser }),
        });
      }

      if (url.includes(`/api/feed/`)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ album: otherUserAlbums }),
        });
      }

      if (url.includes(`/api/follower`)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: followedByUser1 }),
        });
      }

      if (url.includes(`/api/followed`)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: followersOfUser1 }),
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

    const { getByTestId, findByText, getAllByText, getByText } = render(
      <UserPage />,
    );
    await waitFor(() => {
      const names = getAllByText(otherUser.name);

      expect(names.length).toBeGreaterThan(0);
      otherUserAlbums.forEach((album) => {
        expect(getByText(album.title)).toBeTruthy();
      });
    });

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
