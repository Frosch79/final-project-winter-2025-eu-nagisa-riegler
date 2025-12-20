import { expect, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import * as Paper from 'react-native-paper';
import type { Props } from '../UserPhotoCard';
import UserPhotoCard from '../UserPhotoCard';

// react native paper mock
const cardTitleMock: any = (props: any) => (
  <View>
    <Text>{props}</Text>
  </View>
);

jest.mock('react-native-paper', () => ({
  Card: {
    Title: cardTitleMock,
  },
})) as unknown as jest.Mocked<typeof Paper>;
//  mock end

const mockNavigate = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));
const baseProps: Props = {
  photoTitle: 'Valley of the Wind',
  photoDescription: 'Nausicaä gliding on the wind during a golden sunset.',
  photoLocation: 'Valley of the Wind',
  photoUri: 'https://example.com/photos/nausicaa.jpg',
  createdDate: new Date('2025-07-20T18:30:00Z'),
};
const edgeProps: Props = {
  photoTitle: null,
  photoDescription: null,
  photoLocation: 'The Mysterious Forest',
  photoUri: 'file:///mock/ghibli-photo.jpg',
  createdDate: new Date(),
};

export const failProps: Props = {
  photoTitle: '',
  photoDescription: '',
  photoLocation: null,
  photoUri: 'invalid-uri',
  createdDate: new Date('invalid'),
};

describe('userPhotoCard with base data', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });
    mockNavigate.mockClear();
  });

  test('renders user photo descriptions', () => {
    const { getByText } = render(<UserPhotoCard {...baseProps} />);
    expect(getByText('Valley of the Wind')).toBeTruthy();
    expect(
      getByText('Nausicaä gliding on the wind during a golden sunset.'),
    ).toBeTruthy();
    expect(getByText('Valley of the Wind')).toBeTruthy();
  });

  test('render photo uri', () => {
    const { getByTestId } = render(<UserPhotoCard {...baseProps} />);

    expect(getByTestId('photo-image')).toBeTruthy();
  });

  test('renders formatted created date', () => {
    const { getByText } = render(<UserPhotoCard {...baseProps} />);

    const formattedDate = dayjs(baseProps.createdDate).format('YYYY-MM-DD');
    expect(getByText(formattedDate)).toBeTruthy();
  });
});

describe('userPhotoCard with edge data', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });
    mockNavigate.mockClear();
  });

  test('renders user photo descriptions', () => {
    const { queryByTestId, getByTestId } = render(
      <UserPhotoCard {...edgeProps} />,
    );

    expect(queryByTestId('description')).toBeNull();
    expect(queryByTestId('title')).toBeNull();
    expect(getByTestId('location')).toBeTruthy();
  });

  test('render photo uri', () => {
    const { getByTestId } = render(<UserPhotoCard {...edgeProps} />);

    expect(getByTestId('photo-image')).toBeTruthy();
  });

  test('renders formatted created date', () => {
    const { getByText } = render(<UserPhotoCard {...edgeProps} />);

    const formattedDate = dayjs(edgeProps.createdDate).format('YYYY-MM-DD');
    expect(getByText(formattedDate)).toBeTruthy();
  });
});

describe('userPhotoCard with edge data', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });
    mockNavigate.mockClear();
  });

  test('renders placeholder or fallback for invalid image URI', () => {
    const { queryByTestId } = render(<UserPhotoCard {...failProps} />);

    expect(queryByTestId('description')).toBeNull();
    expect(queryByTestId('title')).toBeNull();
    expect(queryByTestId('location')).toBeNull();
  });

  test('render photo uri', () => {
    const { getByTestId } = render(<UserPhotoCard {...failProps} />);

    const image = getByTestId('photo-image');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(image.props.source.uri).toBe('https://example.com/fallback.jpg');
  });

  test('renders formatted created date', () => {
    const { getByText } = render(<UserPhotoCard {...failProps} />);

    const formattedDate = dayjs(failProps.createdDate).format('YYYY-MM-DD');

    expect(getByText(formattedDate)).toBeTruthy();
  });
});
