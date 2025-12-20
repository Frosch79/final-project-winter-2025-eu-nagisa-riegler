import { expect, jest, test } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import * as Paper from 'react-native-paper';
import type { Props } from '../UserFeed';
import UserFeed from '../UserFeed';

// react native paper mock
const cardTtestleMock: any = (props: any) => (
  <View>
    <Text>{props}</Text>
  </View>
);

jest.mock('react-native-paper', () => ({
  Card: {
    Ttestle: cardTtestleMock,
  },
})) as unknown as jest.Mocked<typeof Paper>;
//  mock end

const mockNavigate = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    navigate: mockNavigate,
  })),
}));

const baseProps: Props = {
  albumTitle: 'My Album',
  userName: 'Alice',
  albumDescription: 'This is a test album',
  albumLocation: 'Tokyo',
  createdDate: new Date('2024-01-01'),
  albumCover: 'https://example.com/image.jpg',
  albumComment: 3,
  albumLike: 10,
  albumId: 42,
};

describe('UserFeed', () => {
  test('renders user name and album title', () => {
    const { getByText } = render(<UserFeed {...baseProps} />);

    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('My Album')).toBeTruthy();
  });

  test('renders formatted created date', () => {
    const { getByText } = render(<UserFeed {...baseProps} />);

    const formattedDate = dayjs(baseProps.createdDate).format('YYYY-MM-DD');
    expect(getByText(formattedDate)).toBeTruthy();
  });

  test('renders description and location when provided', () => {
    const { getByText } = render(<UserFeed {...baseProps} />);

    expect(getByText('This is a test album')).toBeTruthy();
    expect(getByText('Tokyo')).toBeTruthy();
  });

  test('does not render description if null', () => {
    const { queryByText } = render(
      <UserFeed {...baseProps} albumDescription={null} />,
    );

    expect(queryByText('This is a test album')).toBeNull();
  });

  test('navigates to album detail when pressed', () => {
    const { getByTestId } = render(<UserFeed {...baseProps} />);

    fireEvent.press(getByTestId('route'));

    expect(mockNavigate).toHaveBeenCalledWith({
      params: { albumId: 42 },
      pathname: '/album/[albumId]',
    });
  });

  test('renders like and comment counts', () => {
    const { getByText } = render(<UserFeed {...baseProps} />);

    expect(getByText('10')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
  });
});

// failure cases
describe('UserFeed  failure cases', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });
    mockNavigate.mockClear();
  });

  test('fails to render when userName is missing', () => {
    const props = { ...baseProps, userName: '' as unknown as string };
    const { getByText } = render(<UserFeed {...props} />);

    expect(getByText('?')).toBeTruthy();
  });

  test('fails to navigate if albumId is wrong', () => {
    const props = { ...baseProps, albumId: undefined as unknown as number };
    const { getByTestId } = render(<UserFeed {...props} />);

    fireEvent.press(getByTestId('route'));

    expect(mockNavigate).not.toHaveBeenCalledWith({
      pathname: '/album/[albumId]',
      params: { albumId: 42 },
    });
  });

  test('fails to render like and comment counts if negative', () => {
    const props = { ...baseProps, albumLike: -1, albumComment: -5 };
    const { queryByText } = render(<UserFeed {...props} />);
    expect(queryByText('-1')).toBeNull();
    expect(queryByText('-5')).toBeNull();
  });
});
