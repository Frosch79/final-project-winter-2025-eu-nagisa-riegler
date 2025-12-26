import { expect, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import * as Paper from 'react-native-paper';
import { paperMock } from '../../util/__tests__/__mock__/paperMock';
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

// import paper mock
paperMock();

const modal: React.FC<any> = (idSwitch, onDismiss) => {
  return (
    <>
      <Text testID={`modal-${idSwitch}`}>Modal Open</Text>
      <Text testID="modal-dismiss" onPress={onDismiss}>
        Close
      </Text>
    </>
  );
};

jest.mock('../ModalShowFollows', () => {
  return jest.fn(({ visible, idSwitch, onDismiss }) => {
    return visible ? modal(idSwitch, onDismiss) : null;
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
    const { getByTestId, queryByTestId } = render(
      <Paper.PaperProvider>
        <UserCard {...baseProps} />
      </Paper.PaperProvider>,
    );
    expect(queryByTestId('modal-follower')).toBeNull();
    fireEvent.press(getByTestId('follower'));
    expect(getByTestId('modal-follower')).toBeTruthy();
  });

  test('opens followed modal when Followed button is pressed', () => {
    const { getByTestId, queryByTestId } = render(
      <Paper.PaperProvider>
        <UserCard {...baseProps} />
      </Paper.PaperProvider>,
    );

    expect(queryByTestId('modal-followed')).toBeNull();

    fireEvent.press(getByTestId('followed'));

    expect(getByTestId('modal-followed')).toBeTruthy();
  });

  test('closes follower modal when onDismiss is called', () => {
    const { getByTestId, queryByTestId } = render(
      <Paper.PaperProvider>
        <UserCard {...baseProps} />
      </Paper.PaperProvider>,
    );

    fireEvent.press(getByTestId('follower'));
    expect(getByTestId('modal-follower')).toBeTruthy();

    fireEvent.press(getByTestId('modal-dismiss'));

    expect(queryByTestId('modal-follower')).toBeNull();
  });

  test('shows Followed button when isFollow is true', () => {
    const { getByText } = render(
      <Paper.PaperProvider>
        <UserCard {...baseProps} onSwitch={false} isFollow={true} />
      </Paper.PaperProvider>,
    );

    expect(getByText('Followed')).toBeTruthy();
  });
});

describe('UserCard edge cases', () => {
  test('renders user data', () => {
    const { getByText } = render(
      <Paper.PaperProvider>
        <UserCard {...edgeProps} />
      </Paper.PaperProvider>,
    );
    expect(getByText(edgeProps.userData.name)).toBeTruthy();
    expect(getByText(`Country: ${edgeProps.userData.country}`)).toBeTruthy();
    expect(
      edgeProps.userData.accountDescription
        ? getByText(edgeProps.userData.accountDescription)
        : true,
    ).toBeTruthy();
  });

  test('shows edit and write-album . And not shows follow and Mypage button when onSwitch is true', () => {
    const { getByTestId, queryByTestId } = render(
      <Paper.PaperProvider>
        <UserCard {...edgeProps} onSwitch={true} />
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
        <UserCard {...edgeProps} onSwitch={false} />
      </Paper.PaperProvider>,
    );

    expect(queryByTestId('edit')).toBeNull();
    expect(queryByTestId('write-album')).toBeNull();
    expect(getByTestId('follow-button')).toBeTruthy();
    expect(getByTestId('my-page-nav')).toBeTruthy();
  });

  test('opens follower modal when Follower button is pressed', () => {
    const { getByTestId, queryByTestId } = render(
      <Paper.PaperProvider>
        <UserCard {...edgeProps} />
      </Paper.PaperProvider>,
    );
    expect(queryByTestId('modal-follower')).toBeNull();
    fireEvent.press(getByTestId('follower'));
    expect(getByTestId('modal-follower')).toBeTruthy();
  });

  test('opens followed modal when Followed button is pressed', () => {
    const { getByTestId, queryByTestId } = render(
      <Paper.PaperProvider>
        <UserCard {...edgeProps} />
      </Paper.PaperProvider>,
    );

    expect(queryByTestId('modal-followed')).toBeNull();

    fireEvent.press(getByTestId('followed'));

    expect(getByTestId('modal-followed')).toBeTruthy();
  });

  test('closes follower modal when onDismiss is called', () => {
    const { getByTestId, queryByTestId } = render(
      <Paper.PaperProvider>
        <UserCard {...edgeProps} />
      </Paper.PaperProvider>,
    );

    fireEvent.press(getByTestId('follower'));
    expect(getByTestId('modal-follower')).toBeTruthy();

    fireEvent.press(getByTestId('modal-dismiss'));

    expect(queryByTestId('modal-follower')).toBeNull();
  });

  test('shows Followed button when isFollow is true', () => {
    const { getByText } = render(
      <Paper.PaperProvider>
        <UserCard {...edgeProps} onSwitch={false} isFollow={true} />
      </Paper.PaperProvider>,
    );

    expect(getByText('Followed')).toBeTruthy();
  });
});

describe('UserCard failure cases', () => {
  test('renders user data', () => {
    const { getByTestId } = render(
      <Paper.PaperProvider>
        <UserCard {...failProps} />
      </Paper.PaperProvider>,
    );
    expect(getByTestId('user-undefined')).toBeTruthy();
  });

  test('Not shows edit ,write-album and follow ,and shows Mypage nav button when props data undefined', () => {
    const { getByTestId, queryByTestId } = render(
      <Paper.PaperProvider>
        <UserCard {...failProps} onSwitch={false} />
      </Paper.PaperProvider>,
    );

    expect(queryByTestId('edit')).toBeNull();
    expect(queryByTestId('write-album')).toBeNull();
    expect(queryByTestId('follow-button')).toBeNull();
    expect(getByTestId('my-page-nav')).toBeTruthy();
  });

  test('Do not show follower and followed button when user undefined', () => {
    const { queryByTestId } = render(
      <Paper.PaperProvider>
        <UserCard {...failProps} />
      </Paper.PaperProvider>,
    );
    expect(queryByTestId('follower')).toBeNull();
    expect(queryByTestId('followed')).toBeNull();
  });
});
