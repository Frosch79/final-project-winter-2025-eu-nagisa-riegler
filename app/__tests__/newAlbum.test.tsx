import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useFocusEffect, useRouter } from 'expo-router';
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

    (useFocusEffect as jest.Mock).mockImplementation((callback: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      callback();
    });
  });

  test('redirects to login when user is not authenticated', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        // eslint-disable-next-line @typescript-eslint/require-await
        json: async () => ({ error: 'Not logged in' }),
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
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/user') {
        return Promise.resolve({
          ok: true,
          // eslint-disable-next-line @typescript-eslint/require-await
          json: async () => ({ id: 'user123' }),
        } as Response);
      }
      if (url === '/api/albums') {
        return Promise.resolve({
          ok: true,
          // eslint-disable-next-line @typescript-eslint/require-await
          json: async () => ({ album: { id: '123' } }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId, getByText } = render(<PostMyAlbum />);
    const titleInput = getByTestId('input-album-title');
    const descriptionInput = getByTestId('input-description');
    const location = getByTestId('input-location');
    const visibility = getByText('Followers Only');

    fireEvent.changeText(titleInput, 'My Album');
    fireEvent.changeText(descriptionInput, 'My description');
    fireEvent.changeText(location, 'My Location');

    fireEvent.press(visibility);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(titleInput.props.value).toBe('My Album');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(descriptionInput.props.value).toBe('My description');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(location.props.value).toBe('My Location');

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
          // eslint-disable-next-line @typescript-eslint/require-await
          json: async () => ({ mockFailUser }),
        } as Response),
      )

      // POST album fails
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          // eslint-disable-next-line @typescript-eslint/require-await
          json: async () => ({ error: 'Failed to create' }),
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
