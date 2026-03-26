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

    (useFocusEffect as jest.Mock).mockImplementation((callback: unknown) => {
      useEffect(() => {
        if (typeof callback === 'function') {
          (callback as () => void)();
        }
      }, [callback]);
    });
  });

  test('redirects to login when unauthenticated', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ error: 'Not logged in' }),
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
        json: () => Promise.resolve({ user: totoro }),
      } as Response),
    );

    const { getByTestId, getByDisplayValue } = render(<EditAccount />);

    await waitFor(() => {
      expect(getByTestId('card')).toBeTruthy();
      expect(getByDisplayValue(totoro.name)).toBeTruthy();
      expect(getByDisplayValue(totoro.country)).toBeTruthy();

      if (totoro.accountDescription) {
        expect(getByDisplayValue(totoro.accountDescription)).toBeTruthy();
      }
    });
  });

  test('shows error if name or country is empty', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ user: totoro }),
      } as Response),
    );

    const { getByText } = render(<EditAccount />);

    fireEvent.press(getByText('EDIT'));

    await waitFor(() => {
      expect(getByText('you have to fill name and country')).toBeTruthy();
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
        if (url === '/api/user/' && !options) {
          return Promise.resolve({
            json: () => Promise.resolve({ user: totoro }),
          });
        }

        if (url === '/api/user/' && init?.method === 'PUT') {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                user: { ...totoro },
              }),
          });
        }

        return Promise.reject(new Error('Unknown URL'));
      },
    );

    const { getByTestId, getByText, getByDisplayValue } = render(
      <EditAccount />,
    );

    await waitFor(() => {
      expect(getByTestId('card')).toBeTruthy();
    });

    const nameInput = getByTestId('edit-name');
    const countryInput = getByTestId('edit-country');
    const descriptionInput = getByTestId('edit-description');

    fireEvent.changeText(nameInput, 'New Name');
    fireEvent.changeText(countryInput, 'Japan');
    fireEvent.changeText(descriptionInput, 'New Description');

    expect(getByDisplayValue('New Name')).toBeTruthy();
    expect(getByDisplayValue('Japan')).toBeTruthy();
    if (totoro.accountDescription) {
      expect(getByDisplayValue('New Description')).toBeTruthy();
    }

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
          json: () => Promise.resolve({ user: totoro }),
        } as Response),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Update failed' }),
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
        json: () => Promise.resolve({ user: totoro }),
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
