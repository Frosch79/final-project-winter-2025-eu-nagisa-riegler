import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useEffect } from 'react';
import Register from '../(auth)/register';
import { mockReplace } from '../../jest.setup';
import {
  registerUser,
  registerUserFail,
  registerUserSuccess,
} from '../../util/__tests__/__mock__/testUser';

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
  useRouter: jest.fn(),
}));

describe('Register screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
    });

    (useFocusEffect as jest.Mock).mockImplementation((callback: unknown) => {
      useEffect(() => {
        if (typeof callback === 'function') {
          (callback as () => void)();
        }
      }, [callback]);
    });
  });

  test('redirects to user page if already logged in', async () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ user: { id: 1 } }),
      }),
    );

    render(<Register />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)/(user)/user');
    });
  });

  test('successfully registers a new user', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: any) => {
      if (url === '/api/user') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
      if (url === '/api/register') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ user: { id: 2, ...registerUserSuccess } }),
        });
      }
    });

    const { getByTestId } = render(<Register />);

    fireEvent.changeText(
      getByTestId('input-username'),
      registerUserSuccess.name,
    );
    fireEvent.changeText(getByTestId('input-birthday'), '2020-10-10');
    fireEvent.changeText(
      getByTestId('input-country'),
      registerUserSuccess.country,
    );
    fireEvent.changeText(
      getByTestId('input-description'),
      registerUserSuccess.accountDescription,
    );
    fireEvent.changeText(getByTestId('input-email'), registerUserSuccess.email);
    fireEvent.changeText(
      getByTestId('input-password'),
      registerUserSuccess.password,
    );
    fireEvent.changeText(
      getByTestId('input-confirm-password'),
      registerUserSuccess.password,
    );

    fireEvent.press(getByTestId('register'));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)/(user)/user');
    });
  });

  test('shows error message when registration fails', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: any) => {
      if (url === '/api/register') {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Email already exists' }),
        });
      }
      if (url === '/api/user') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
    });

    const { getByTestId, getByText } = render(<Register />);

    fireEvent.changeText(getByTestId('input-username'), registerUserFail.name);
    fireEvent.changeText(getByTestId('input-birthday'), '2020-10-10');
    fireEvent.changeText(
      getByTestId('input-country'),
      registerUserFail.country,
    );
    fireEvent.changeText(
      getByTestId('input-description'),
      registerUserFail.accountDescription,
    );
    fireEvent.changeText(getByTestId('input-email'), registerUserFail.email);
    fireEvent.changeText(
      getByTestId('input-password'),
      registerUserFail.password,
    );
    fireEvent.changeText(
      getByTestId('input-confirm-password'),
      registerUserFail.password,
    );

    fireEvent.press(getByTestId('register'));

    await waitFor(() => {
      expect(getByText('Email already exists')).toBeTruthy();
    });
  });

  test('register button cannot be pressed when required fields are empty', () => {
    const { getByTestId } = render(<Register />);
    const registerButton = getByTestId('register');

    fireEvent.press(registerButton);

    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('register button cannot be pressed when password and confirm password do not match', () => {
    const { getByTestId } = render(<Register />);
    const registerButton = getByTestId('register');

    fireEvent.changeText(getByTestId('input-username'), registerUser.name);
    fireEvent.changeText(getByTestId('input-birthday'), '2020-10-10');
    fireEvent.changeText(getByTestId('input-email'), registerUser.email);
    fireEvent.changeText(getByTestId('input-password'), 'password123');
    fireEvent.changeText(
      getByTestId('input-confirm-password'),
      'wrong-password',
    );

    fireEvent.press(registerButton);

    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('register button can be pressed when required fields are filled and passwords match', async () => {
    const { getByTestId } = render(<Register />);
    const registerButton = getByTestId('register');

    fireEvent.changeText(getByTestId('input-username'), registerUser.name);
    fireEvent.changeText(getByTestId('input-birthday'), '2020-10-10');
    fireEvent.changeText(getByTestId('input-email'), registerUser.email);
    fireEvent.changeText(getByTestId('input-password'), registerUser.password);
    fireEvent.changeText(
      getByTestId('input-confirm-password'),
      registerUser.password,
    );

    (global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ user: { id: 1, ...registerUser } }),
      }),
    );

    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)/(user)/user');
    });
  });
  test('navigates to login page when pressing login button', async () => {
    const { getByText } = render(<Register />);
    fireEvent.press(getByText('login'));
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
    });
  });
});
