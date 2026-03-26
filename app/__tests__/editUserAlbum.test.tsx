import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { mockNavigate, mockReplace } from '../../jest.setup';
import { paperMock } from '../../util/__tests__/__mock__/paperMock';
import { mockAlbum } from '../../util/__tests__/__mock__/testAlbumPhoto';
import { totoro } from '../../util/__tests__/__mock__/testUser';
import EditAlbum from '../album/editAlbum/[editId]';

paperMock();

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
  useFocusEffect: jest.fn(),
}));

describe('EditAlbum screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useLocalSearchParams as jest.Mock).mockReturnValue({
      editId: '123',
    });

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

  test('redirects to login when unauthenticated', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ error: 'Not logged in' }),
        } as Response),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,

          json: () => Promise.resolve({}),
        } as Response),
      );
    render(<EditAlbum />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        '/(auth)/login?returnTo=/album/editAlbum/[editId]',
      );
    });
  });

  test('sets album data on successful fetch', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ user: mockAlbum.userId }),
        } as Response),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ album: mockAlbum }),
        } as Response),
      );

    const { getByText, getByDisplayValue } = render(<EditAlbum />);
    await waitFor(() => {
      expect(getByText('Edit Album')).toBeTruthy();
      expect(getByDisplayValue(mockAlbum.title)).toBeTruthy();

      if (mockAlbum.location) {
        expect(getByDisplayValue(mockAlbum.location)).toBeTruthy();
      }
      if (mockAlbum.description) {
        expect(getByDisplayValue(mockAlbum.description)).toBeTruthy();
      }
    });
  });

  test('does nothing when album fetch returns error', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ user: totoro }),
        } as Response),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ error: 'Album not found' }),
        } as Response),
      );

    render(<EditAlbum />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  test('shows error if title is empty', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ user: totoro }),
        } as Response),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ album: mockAlbum }),
        } as Response),
      );

    const { getByText } = render(<EditAlbum />);

    fireEvent.press(getByText('EDIT'));

    await waitFor(() => {
      expect(getByText('Please write a title')).toBeTruthy();
    });
  });

  test('PUT sends correct body and redirects on success', async () => {
    (global.fetch as jest.Mock).mockImplementation(
      (input: unknown, options?: unknown) => {
        const url =
          typeof input === 'string'
            ? input
            : input instanceof Request
              ? input.url
              : '';

        const init = options as { method?: string } | undefined;
        if (url === '/api/user') {
          return Promise.resolve({
            json: () => Promise.resolve({ user: totoro }),
          });
        }

        if (url === '/api/albums/123' && !options) {
          return Promise.resolve({
            json: () => Promise.resolve({ album: mockAlbum }),
          });
        }

        if (url === '/api/albums/123' && init?.method === 'PUT') {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                album: { ...mockAlbum, id: 123 },
              }),
          });
        }

        return Promise.reject(new Error('Unknown URL'));
      },
    );

    const { getByTestId, getByText, getByDisplayValue } = render(<EditAlbum />);

    await waitFor(() => expect(getByText('Edit Album')).toBeTruthy());

    const titleEdit = getByTestId('edit-album-title');
    const descriptionEdit = getByTestId('edit-album-description');
    const locationEdit = getByTestId('edit-album-location');
    const visibility = getByText('Followers Only');

    fireEvent.changeText(titleEdit, 'My Album');
    fireEvent.changeText(descriptionEdit, 'My description');
    fireEvent.changeText(locationEdit, 'My Location');
    fireEvent.press(visibility);

    expect(getByDisplayValue('My Album')).toBeTruthy();
    expect(getByDisplayValue('My description')).toBeTruthy();
    expect(getByDisplayValue('My Location')).toBeTruthy();

    fireEvent.press(getByText('EDIT'));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/albums/123',
        expect.objectContaining({
          method: 'PUT',
        }),
      );
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/album/[albumId]',
        params: { albumId: '123', from: 'editAlbum' },
      });
    });
  });

  test('shows error when PUT fails', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ user: totoro }),
        } as Response),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ album: mockAlbum }),
        } as Response),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,

          json: () => Promise.resolve({ error: 'Update failed' }),
        } as Response),
      );

    const { getByText, getByTestId, getByDisplayValue } = render(<EditAlbum />);

    await waitFor(() => {
      expect(getByText('Edit Album')).toBeTruthy();
    });

    const titleEdit = getByTestId('edit-album-title');
    const descriptionEdit = getByTestId('edit-album-description');
    const locationEdit = getByTestId('edit-album-location');
    const visibility = getByText('Followers Only');

    fireEvent.changeText(titleEdit, 'My Album');
    fireEvent.changeText(descriptionEdit, 'My description');
    fireEvent.changeText(locationEdit, 'My Location');
    fireEvent.press(visibility);

    expect(getByDisplayValue('My Album')).toBeTruthy();
    expect(getByDisplayValue('My description')).toBeTruthy();
    expect(getByDisplayValue('My Location')).toBeTruthy();

    fireEvent.press(getByText('EDIT'));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/albums/123',
        expect.objectContaining({
          method: 'PUT',
        }),
      );
      expect(getByTestId('error-message')).toBeTruthy();
    });
  });

  test('DELETE success redirects', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ user: totoro }),
        } as Response),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              album: mockAlbum,
            }),
        } as Response),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,

          json: () => Promise.resolve({}),
        } as Response),
      );

    const { getByText } = render(<EditAlbum />);

    fireEvent.press(getByText('DELETE'));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)/(user)/user');
    });
  });

  test('shows error when DELETE fails', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ user: totoro }),
        } as Response),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ album: mockAlbum }),
        } as Response),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,

          json: () => Promise.resolve({ error: 'Delete failed' }),
        } as Response),
      );

    const { getByText, getByTestId } = render(<EditAlbum />);

    await waitFor(() => {
      expect(getByText('Edit Album')).toBeTruthy();
    });

    fireEvent.press(getByTestId('delete-button'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/albums/123',
        expect.objectContaining({
          method: 'DELETE',
        }),
      );
      expect(getByTestId('error-message')).toBeTruthy();
    });
  });

  test('Cancel button redirects to user page', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ user: totoro }),
        } as Response),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              album: mockAlbum,
            }),
        } as Response),
      );

    const { getByTestId, getByText } = render(<EditAlbum />);

    await waitFor(() => {
      expect(getByText('Edit Album')).toBeTruthy();
    });

    fireEvent.press(getByTestId('cancel-button'));
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)/(user)/user');
    });
  });
});
