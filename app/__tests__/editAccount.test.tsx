/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */

import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useEffect } from 'react';
import EditAccount from '../(tabs)/(user)/(editAccount)/editAccount';
import { mockNavigate, mockReplace } from '../../jest.setup';
import { paperMock } from '../../util/__tests__/__mock__/paperMock';
import { totoro } from '../../util/__tests__/__mock__/testUser';

paperMock();

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useFocusEffect: jest.fn(),
}));

describe('EditAccount screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
      navigate: mockNavigate,
    });

    (useFocusEffect as jest.Mock).mockImplementation((callback: any) => {
      useEffect(callback, []);
    });
  });

  test('redirects to login when unauthenticated', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        json: async () => ({ error: 'Not logged in' }),
      } as Response),
    );

    render(<EditAccount />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        '/(auth)/login?returnTo=/(tabs)/(user)/(editAccount)/editAccount',
      );
    });
  });

  test('sets user data on successful fetch', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        json: async () => ({ user: totoro }),
      } as Response),
    );

    const { getByTestId } = render(<EditAccount />);

    await waitFor(() => {
      expect(getByTestId('card')).toBeTruthy();

      expect(getByTestId('edit-name').props.value).toBe(totoro.name);

      expect(getByTestId('edit-country').props.value).toBe(totoro.country);

      if (totoro.accountDescription) {
        expect(getByTestId('edit-description').props.value).toBe(
          totoro.accountDescription,
        );
      }
    });
  });

  test('shows error if name or country is empty', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        json: async () => ({ user: totoro }),
      } as Response),
    );

    const { getByText } = render(<EditAccount />);

    fireEvent.press(getByText('EDIT'));

    await waitFor(() => {
      expect(getByText('you have to fill name and country')).toBeTruthy();
    });
  });

  test('PUT sends correct body and redirects on success', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: any, options: any) => {
      if (url === '/api/user/' && !options) {
        return Promise.resolve({
          json: async () => ({ user: totoro }),
        });
      }

      if (url === '/api/user/' && options?.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            user: { ...totoro },
          }),
        });
      }

      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId, getByText } = render(<EditAccount />);

    await waitFor(() => {
      expect(getByTestId('card')).toBeTruthy();
    });

    const nameInput = getByTestId('edit-name');
    const countryInput = getByTestId('edit-country');
    const descriptionInput = getByTestId('edit-description');

    fireEvent.changeText(nameInput, 'New Name');
    fireEvent.changeText(countryInput, 'Japan');
    fireEvent.changeText(descriptionInput, 'New Description');

    expect(nameInput.props.value).toBe('New Name');
    expect(countryInput.props.value).toBe('Japan');
    expect(descriptionInput.props.value).toBe('New Description');

    fireEvent.press(getByText('EDIT'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/user/',
        expect.objectContaining({
          method: 'PUT',
        }),
      );

      expect(mockReplace).toHaveBeenCalledWith('/(tabs)/(user)/user');
    });
  });

  test('shows error when PUT fails', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: async () => ({ user: totoro }),
        } as Response),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Update failed' }),
        } as Response),
      );

    const { getByTestId, getByText } = render(<EditAccount />);

    await waitFor(() => {
      expect(getByTestId('card')).toBeTruthy();
    });

    const nameInput = getByTestId('edit-name');
    const countryInput = getByTestId('edit-country');

    fireEvent.changeText(nameInput, 'New Name');
    fireEvent.changeText(countryInput, 'Japan');

    fireEvent.press(getByText('EDIT'));

    await waitFor(() => {
      expect(getByText('Update failed')).toBeTruthy();
    });
  });

  test('Cancel button redirects to user page', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        json: async () => ({ user: totoro }),
      } as Response),
    );

    const { getByText, getByTestId } = render(<EditAccount />);

    await waitFor(() => {
      expect(getByTestId('card')).toBeTruthy();
    });

    fireEvent.press(getByText('Cancel'));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)/(user)/user');
    });
  });
});
