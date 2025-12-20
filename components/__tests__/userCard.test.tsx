import { expect, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import dayjs from 'dayjs';
import { ReactNode } from 'react';
import { Text, View } from 'react-native';
import * as Paper from 'react-native-paper';
import {
  mockFollowUser1,
  mockFollowUser2,
} from '../../util/__tests__/__mock__/testFollows';
import {
  mockFullUser,
  mockFullUserInvalidDate,
  mockFullUserNoDescription,
} from '../../util/__tests__/__mock__/testUser';
import UserCard from '../UserCard';

// react native paper mock
const cardTitleMock: any = (props: any) => (
  <View>
    <Text>{props}</Text>
  </View>
);
const avatarTextMock: any = ({ label }: any) => (
  <View testID="avatar">
    <Text>{label}</Text>
  </View>
);
export const PaperProviderMock: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return <>{children}</>;
};

export const buttonMock: React.FC<any> = ({ children, onPress, testID }) => {
  return (
    <Text
      testID={testID}
      onPress={onPress} // fireEvent.press
    >
      {children}
    </Text>
  );
};

jest.mock('react-native-paper', () => {
  return {
    Provider: PaperProviderMock,
    Card: {
      Title: cardTitleMock,
      Content: cardTitleMock,
    },
    Portal: PaperProviderMock,
    Avatar: avatarTextMock,
    Button: buttonMock,
  };
}) as unknown as jest.Mocked<typeof Paper>;
//  mock end

// modal mock

jest.mock('../ModalShowFollows', () => {
  return jest.fn((props: any) => {
    if (!props.visible) return null;

    return {
      type: 'ModalShowFollows',
      props: {
        testID: `modal-${props.idSwitch}`,
      },
    };
  });
});

export const baseProps = {
  userData: mockFullUser,
  editMyAccount: jest.fn(),
  editOnPress: jest.fn(),
  homeOnPress: jest.fn(),
  followOnPress: jest.fn(),
  onSwitch: true,
  isFollow: false,
  followedUsersItem: [mockFollowUser1, mockFollowUser2],
  followerUsersItem: [mockFollowUser1],
};

// -----------------------------
// Props: Edge case（description null, empty follow lists）
// -----------------------------
export const edgeProps = {
  userData: mockFullUserNoDescription,
  editMyAccount: jest.fn(),
  editOnPress: jest.fn(),
  homeOnPress: jest.fn(),
  followOnPress: jest.fn(),
  onSwitch: false,
  isFollow: true,
  followedUsersItem: [],
  followerUsersItem: [],
};

// -----------------------------
// Props: Fail case（invalid date, undefined handlers）
// -----------------------------
export const failProps = {
  userData: mockFullUserInvalidDate,
  editMyAccount: undefined,
  editOnPress: undefined,
  homeOnPress: undefined,
  followOnPress: undefined,
  onSwitch: true,
  isFollow: false,
  followedUsersItem: [],
  followerUsersItem: [],
};

describe('UserCard', () => {
  test('renders user data', () => {
    const { getByText } = render(
      <Paper.PaperProvider>
        <UserCard {...baseProps} />
      </Paper.PaperProvider>,
    );
    expect(getByText(baseProps.userData.name)).toBeTruthy();
    expect(getByText(`Country: ${baseProps.userData.country}`)).toBeTruthy();
    expect(
      baseProps.userData.accountDescription
        ? getByText(baseProps.userData.accountDescription)
        : true,
    ).toBeTruthy();
  });

  test('shows edit and write-album . And not shows follow and Mypage button when onSwitch is true', () => {
    const { getByTestId, queryByTestId } = render(
      <Paper.PaperProvider>
        <UserCard {...baseProps} onSwitch={true} />
      </Paper.PaperProvider>,
    );

    expect(getByTestId('edit')).toBeTruthy();
    expect(getByTestId('write-album')).toBeTruthy();
    expect(queryByTestId('follow-button')).toBeNull();
    expect(queryByTestId('my-page-nav')).toBeNull();
  });

  test('Not shows edit and write-album. And  shows follow and Mypage nav button when onSwitch is false', () => {
    const { getByTestId, queryByTestId } = render(
      <Paper.PaperProvider>
        <UserCard {...baseProps} onSwitch={false} />
      </Paper.PaperProvider>,
    );

    expect(queryByTestId('edit')).toBeNull();
    expect(queryByTestId('write-album')).toBeNull();
    expect(getByTestId('follow-button')).toBeTruthy();
    expect(getByTestId('my-page-nav')).toBeTruthy();
  });

  test('opens follower modal when Follower button is pressed', () => {
    const { getByText, getByTestId } = render(
      <Paper.PaperProvider>
        <UserCard {...baseProps} />
      </Paper.PaperProvider>,
    );

    fireEvent.press(getByTestId('follower').props.onPress);

    expect(getByTestId('modal-follower')).toBeTruthy();
  });
});
