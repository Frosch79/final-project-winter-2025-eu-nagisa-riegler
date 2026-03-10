/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable react-hooks/exhaustive-deps */
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import Login from '../(auth)/login';
import {
  loginUserFail,
  loginUserSuccess,
} from '../../util/__tests__/__mock__/testUser';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  useFocusEffect: jest.fn(),
}));

describe('Login screen', () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
    });
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
    (useFocusEffect as jest.Mock).mockImplementation((callback: any) => {
      useEffect(callback, []);
    });
    jest.clearAllMocks();
  });

  test('cannot press login button if fields are empty', async () => {
    const { getByTestId } = render(<Login />);
    const loginButton = getByTestId('login-button');

    fireEvent.press(loginButton);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('shows error when login fails', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/login') {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Email or password invalid' }),
        });
      }
      if (url === '/api/user') {
        return Promise.resolve({ ok: true, json: async () => ({}) });
      }
    });

    const { getByTestId, getByText } = render(<Login />);

    fireEvent.changeText(getByTestId('input-email'), loginUserFail.email);
    fireEvent.changeText(getByTestId('input-password'), loginUserFail.password);

    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => {
      expect(getByText('Email or password invalid')).toBeTruthy();
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  test('can login when email and password are correct', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/login') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: { ...loginUserSuccess, id: 1 } }),
        });
      }
      if (url === '/api/user') {
        return Promise.resolve({ ok: true, json: async () => ({}) });
      }
    });

    const { getByTestId } = render(<Login />);

    fireEvent.changeText(getByTestId('input-email'), loginUserSuccess.email);
    fireEvent.changeText(
      getByTestId('input-password'),
      loginUserSuccess.password,
    );

    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)/(user)/user');
    });
  });

  test('navigates to returnTo if provided after login', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      returnTo: '/(tabs)/(feeds)/publicFeed',
    });

    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/login') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: { ...loginUserSuccess, id: 1 } }),
        });
      }
      if (url === '/api/user') {
        return Promise.resolve({ ok: true, json: async () => ({}) });
      }
    });

    const { getByTestId } = render(<Login />);

    fireEvent.changeText(getByTestId('input-email'), loginUserSuccess.email);
    fireEvent.changeText(
      getByTestId('input-password'),
      loginUserSuccess.password,
    );

    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)/(feeds)/publicFeed');
    });
  });
});
