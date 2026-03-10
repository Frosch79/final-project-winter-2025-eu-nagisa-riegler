/* eslint-disable @typescript-eslint/no-unsafe-call */
import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { render, waitFor } from '@testing-library/react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import UserAlbumCard from '../../components/UserAlbumCard';
import { mockReplace } from '../../jest.setup';
import { paperMock } from '../../util/__tests__/__mock__/paperMock';
import { mockAlbumByUser } from '../../util/__tests__/__mock__/testAlbumByUser';
import { comments } from '../../util/__tests__/__mock__/testCommentUsers';
import { likes } from '../../util/__tests__/__mock__/testLikeUsers';
import { mockFullUser } from '../../util/__tests__/__mock__/testUser';
import UserAlbum from '../album/[albumId]';

paperMock();

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('../../components/UserAlbumCard', () => jest.fn());

describe('UserAlbum screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useLocalSearchParams as jest.Mock).mockReturnValue({
      albumId: '123',
    });

    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
    });

    (useFocusEffect as jest.Mock).mockImplementation((callback: any) => {
      callback();
    });
  });

  test('redirects to login when user is not authenticated', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          // eslint-disable-next-line @typescript-eslint/require-await
          json: async () => ({ error: 'Not logged in' }),
        } as Response),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          // eslint-disable-next-line @typescript-eslint/require-await
          json: async () => ({}),
        } as Response),
      );

    render(<UserAlbum />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        '/(auth)/login?returnTo=/album/123',
      );
    });
  });

  test('renders album card when user and album fetch succeed', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          // eslint-disable-next-line @typescript-eslint/require-await
          json: async () => ({ user: mockFullUser }),
        } as Response),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          // eslint-disable-next-line @typescript-eslint/require-await
          json: async () => ({ album: mockAlbumByUser }),
        } as Response),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          // eslint-disable-next-line @typescript-eslint/require-await
          json: async () => ({ like: likes }),
        } as Response),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          // eslint-disable-next-line @typescript-eslint/require-await
          json: async () => ({ comment: comments }),
        } as Response),
      );

    render(<UserAlbum />);

    await waitFor(() => {
      const props = (UserAlbumCard as jest.Mock).mock.calls[0];

      expect(props).toMatchObject([
        {
          album: mockAlbumByUser,
          userId: Number(mockFullUser.id),
          albumLikes: likes,
          albumComments: comments,
          onUpdateComment: expect.any(Function),
          onUpdateLike: expect.any(Function),
        },
        {},
      ]);
    });
  });

  test('shows error message when album fetch returns error', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          // eslint-disable-next-line @typescript-eslint/require-await
          json: async () => ({ user: mockFullUser }),
        } as Response),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          // eslint-disable-next-line @typescript-eslint/require-await
          json: async () => ({ error: 'Album not found' }),
        } as Response),
      );

    const { getByText } = render(<UserAlbum />);

    await waitFor(() => {
      expect(getByText('Album not found')).toBeTruthy();
      expect(UserAlbumCard).not.toHaveBeenCalled();
    });
  });

  test('renders "No Photos" when album has no photos', async () => {
    const albumWithoutPhotos = { ...mockAlbumByUser, photos: [] };
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          // eslint-disable-next-line @typescript-eslint/require-await
          json: async () => ({ user: mockFullUser }),
        } as Response),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          // eslint-disable-next-line @typescript-eslint/require-await
          json: async () => ({ album: albumWithoutPhotos }),
        } as Response),
      );

    const { getByText } = render(<UserAlbum />);

    await waitFor(() => {
      expect(getByText('No Photos')).toBeTruthy();
    });
  });
});
