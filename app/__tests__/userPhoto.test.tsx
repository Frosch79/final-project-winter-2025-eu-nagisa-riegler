import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { render, waitFor } from '@testing-library/react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import UserPhotoCard from '../../components/UserPhotoCard';
import { mockReplace } from '../../jest.setup';
import { paperMock } from '../../util/__tests__/__mock__/paperMock';
import { mockFullUser } from '../../util/__tests__/__mock__/testUser';
import { mockUserPhoto } from '../../util/__tests__/__mock__/testUserPhoto';
import UserPhoto from '../photos/[photoId]';

paperMock();
jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('../../components/UserPhotoCard', () => jest.fn());

describe('UserPhoto screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useLocalSearchParams as jest.Mock).mockReturnValue({
      photoId: '123',
    });

    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
    });

    (useFocusEffect as jest.Mock).mockImplementation((callback: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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

    render(<UserPhoto />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        '/(auth)/login?returnTo=/photos/123',
      );
    });
  });

  test('renders photo when user and photo fetch succeed', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          // eslint-disable-next-line @typescript-eslint/require-await
          json: async () => ({ mockFullUser }),
        } as Response),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          // eslint-disable-next-line @typescript-eslint/require-await
          json: async () => ({
            photo: mockUserPhoto,
          }),
        } as Response),
      );

    render(<UserPhoto />);

    await waitFor(() => {
      const firstArgs = (UserPhotoCard as jest.Mock).mock.calls[0];
      expect(firstArgs).toEqual([
        {
          photoTitle: mockUserPhoto.title,
          photoDescription: mockUserPhoto.description,
          photoLocation: mockUserPhoto.location,
          photoUri: mockUserPhoto.cloudinaryDataPath,
          createdDate: mockUserPhoto.createdDate,
        },
        {},
      ]);
    });
  });

  test('does not render photo card when photo fetch returns error', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          // eslint-disable-next-line @typescript-eslint/require-await
          json: async () => ({ mockFullUser }),
        } as Response),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          // eslint-disable-next-line @typescript-eslint/require-await
          json: async () => ({ error: 'Photo not found' }),
        } as Response),
      );

    render(<UserPhoto />);

    await waitFor(() => {
      expect(UserPhotoCard).not.toHaveBeenCalled();
    });
  });
});
