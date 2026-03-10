/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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

    (useFocusEffect as jest.Mock).mockImplementation((callback: any) => {
      useEffect(callback, []);
    });
  });

  test('renders other user and albums when API succeeds', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: any) => {
      if (url === '/api/user') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: mockFullUser }),
        });
      }

      if (url.includes(`/api/users`)) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: otherUser }),
        });
      }

      if (url.includes(`/api/feed/`)) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ album: otherUserAlbums }),
        });
      }

      if (url.includes(`/api/follower`)) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: followedByUser1 }),
        });
      }

      if (url.includes(`/api/followed`)) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: followersOfUser1 }),
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
    (global.fetch as jest.Mock).mockImplementation((url: any, options: any) => {
      if (url === '/api/user') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: mockFullUser }),
        });
      }

      if (url.includes(`/api/users/`)) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: otherUser }),
        });
      }

      if (url.includes(`/api/feed/`)) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ album: otherUserAlbums }),
        });
      }
      if (url === `/api/followed/${otherUserId}`) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ result: false }),
        });
      }
      if (url === `/api/follower?userId=${otherUserId}`) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: followedByUser1 }),
        });
      }
      if (url === `/api/followed?userId=${otherUserId}`) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: followersOfUser1 }),
        });
      }
      if (url === '/api/followed' && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            follow: {
              id: 35,
              followerUserId: 13,
              followedUserId: 2,
              createdDate: '2026-03-06T13:22:55.673Z',
            },
          }),
        });
      }

      if (url === '/api/followed' && options?.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true }),
        });
      }

      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    const { getByText, getAllByText, getByTestId } = render(<UserPage />);

    await waitFor(() => {
      const names = getAllByText(otherUser.name);

      expect(names.length).toBeGreaterThan(0);
      otherUserAlbums.forEach((album) => {
        expect(getByText(album.title)).toBeTruthy();
      });
    });
    const followButton = getByTestId('follow-button');

    expect(getByTestId('follow-button-text').props.children).toBe('Follow');

    fireEvent.press(followButton);
    // Follow
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/followed',
        expect.objectContaining({
          method: 'POST',
        }),
      );

      expect(getByTestId('follow-button-text').props.children).toBe('Followed');
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

      expect(getByTestId('follow-button-text').props.children).toBe('Follow');
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

      if (url.includes(`/api/users`)) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: otherUser }),
        });
      }

      if (url.includes(`/api/feed/`)) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ album: otherUserAlbums }),
        });
      }

      if (url.includes(`/api/follower`)) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: followedByUser1 }),
        });
      }

      if (url.includes(`/api/followed`)) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: followersOfUser1 }),
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

    (global.fetch as jest.Mock).mockImplementation((url: any) => {
      if (url === '/api/user') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: mockFullUser }),
        });
      }

      if (url.includes(`/api/users`)) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: otherUser }),
        });
      }

      if (url.includes(`/api/feed/`)) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ album: otherUserAlbums }),
        });
      }

      if (url.includes(`/api/follower`)) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: followedByUser1 }),
        });
      }

      if (url.includes(`/api/followed`)) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: followersOfUser1 }),
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
