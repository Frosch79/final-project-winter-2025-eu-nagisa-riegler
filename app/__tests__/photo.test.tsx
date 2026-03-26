import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { uploadImage } from '../../components/CloudinaryUpload';
import { mockReplace } from '../../jest.setup';
import PostMyPhotos from '../photos/photo';

jest.mock('../../components/CloudinaryUpload', () => ({
  uploadImage: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  useFocusEffect: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
}));

describe('PostMyPhotos screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });

    (useLocalSearchParams as jest.Mock).mockReturnValue({ albumId: '1' });

    (useFocusEffect as jest.Mock).mockImplementation((callback: unknown) => {
      useEffect(() => {
        if (typeof callback === 'function') {
          (callback as () => void)();
        }
      }, [callback]);
    });
  });

  test('redirects to login if user fetch fails', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/user') {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Not logged in' }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(<PostMyPhotos />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        '/(auth)/login?returnTo=/photos/photo/',
      );
    });
  });

  test('can select image and preview it', async () => {
    // ImagePicker
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: 'file://test.jpg',
          width: 100,
          height: 100,
          mimeType: 'image/jpeg',
        },
      ],
    });

    // uploadImage
    (uploadImage as jest.Mock).mockResolvedValue('https://cloudinary/test.jpg');

    // API mocks
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/user') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 1 }),
        });
      }
      if (url === '/api/albums/1') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              album: { id: 1, title: 'My Album', description: 'Desc' },
            }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    const { getByText, getByTestId } = render(<PostMyPhotos />);

    fireEvent.press(getByText('SELECT PHOTO'));

    await waitFor(() => {
      expect(getByTestId('upload-photo')).toBeTruthy();
      expect(uploadImage).toHaveBeenCalledWith('file://test.jpg');
    });
  });

  test('continue button disabled if no image selected', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/user') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 1 }),
        });
      }
      if (url === '/api/albums/1') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              album: { id: 1, title: 'My Album', description: 'Desc' },
            }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    const { getByTestId } = render(<PostMyPhotos />);
    await waitFor(() => {
      expect(getByTestId('continue-button')).toBeVisible();
    });
    fireEvent.press(getByTestId('continue-button'));
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
