import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { mockNavigate, mockReplace } from '../../jest.setup';
import { paperMock } from '../../util/__tests__/__mock__/paperMock';
import { mockFailUser } from '../../util/__tests__/__mock__/testUser';
import PostMyAlbum from '../album/newAlbum';

paperMock();

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
  useRouter: jest.fn(),
}));

describe('PostMyAlbum screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
      navigate: mockNavigate,
    });

    (useFocusEffect as jest.Mock).mockImplementation((callback: unknown) => {
      useEffect(() => {
        if (typeof callback === 'function') {
          (callback as () => void)();
        }
      }, [callback]);
    });
  });

  test('redirects to login when user is not authenticated', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,

        json: () => Promise.resolve({ error: 'Not logged in' }),
      } as Response),
    );

    render(<PostMyAlbum />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        '/(auth)/login?returnTo=/album/newAlbum',
      );
    });
  });

  test('shows error when title is empty and Ok is pressed', async () => {
    const { getByText } = render(<PostMyAlbum />);
    fireEvent.press(getByText('Ok'));

    await waitFor(() => {
      expect(getByText('Please write a title')).toBeTruthy();
    });
  });

  test('creates album successfully and navigates', async () => {
    (global.fetch as jest.Mock).mockImplementation((input: unknown) => {
      const url = typeof input === 'string' ? input : '';
      if (url === '/api/user') {
        return Promise.resolve({
          ok: true,

          json: () => Promise.resolve({ id: 'user123' }),
        } as Response);
      }
      if (url === '/api/albums') {
        return Promise.resolve({
          ok: true,

          json: () => Promise.resolve({ album: { id: '123' } }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId, getByText, getByDisplayValue } = render(
      <PostMyAlbum />,
    );

    const titleInput = getByTestId('input-album-title');
    const descriptionInput = getByTestId('input-description');
    const location = getByTestId('input-location');
    const visibility = getByText('Followers Only');

    fireEvent.changeText(titleInput, 'My Album');
    fireEvent.changeText(descriptionInput, 'My description');
    fireEvent.changeText(location, 'My Location');
    fireEvent.press(visibility);

    expect(getByDisplayValue('My Album')).toBeTruthy();
    expect(getByDisplayValue('My description')).toBeTruthy();
    expect(getByDisplayValue('My Location')).toBeTruthy();

    fireEvent.press(getByText('Ok'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/albums',
        expect.objectContaining({ method: 'POST' }),
      );
      expect(mockNavigate).toHaveBeenCalledWith({
        pathname: '/album/[albumId]',
        params: { albumId: '123', from: 'editAlbum' },
      });
    });
  });

  test('shows server error when album creation fails', async () => {
    // GET user
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,

          json: () => Promise.resolve({ mockFailUser }),
        } as Response),
      )

      // POST album fails
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,

          json: () => Promise.resolve({ error: 'Failed to create' }),
        } as Response),
      );

    const { getByTestId, getByText } = render(<PostMyAlbum />);

    fireEvent.changeText(getByTestId('input-album-title'), 'My Album');
    fireEvent.changeText(getByTestId('input-description'), 'My description');
    fireEvent.changeText(getByTestId('input-location'), 'My Location');

    fireEvent.press(getByText('Ok'));

    await waitFor(() => {
      expect(getByTestId('error-message')).toBeTruthy();
    });
  });
});
