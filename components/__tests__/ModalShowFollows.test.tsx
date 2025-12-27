import { expect, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import * as Paper from 'react-native-paper';
import { mockNavigate } from '../../jest.setup';
import { paperMock } from '../../util/__tests__/__mock__/paperMock';
import {
  followersOfUser1,
  mockFollowUser1,
} from '../../util/__tests__/__mock__/testFollows';
import ModalShowFollows from '../ModalShowFollows';

const baseProps = {
  visible: true,
  onDismiss: jest.fn(),
  items: followersOfUser1,
  idSwitch: 'follower',
  userId: mockFollowUser1.followerUserId,
};

paperMock();

describe('ModalShowFollows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders modal with items', () => {
    const { getByTestId, getByText } = render(
      <Paper.PaperProvider>
        <ModalShowFollows {...baseProps} />
      </Paper.PaperProvider>,
    );

    expect(getByText('Follower')).toBeTruthy();

    for (const user of baseProps.items) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(getByTestId(`user-name-${user.userName}`).props.children).toBe(
        user.userName,
      );
    }
  });

  test('renders "No Users" when items is empty', () => {
    const { getByText } = render(
      <Paper.PaperProvider>
        <ModalShowFollows {...baseProps} items={[]} />
      </Paper.PaperProvider>,
    );

    expect(getByText('No Users')).toBeTruthy();
  });

  test('calls navigate with correct params when user button pressed', () => {
    const { getByText } = render(
      <Paper.PaperProvider>
        <ModalShowFollows {...baseProps} />
      </Paper.PaperProvider>,
    );
    for (const user of baseProps.items) {
      fireEvent.press(getByText(user.userName));

      expect(mockNavigate).toHaveBeenCalledWith({
        pathname:
          baseProps.userId !== user.followerUserId && '/(tabs)/(user)/[userId]',
        params: { userId: user.followerUserId },
      });
    }
  });

  test('calls onDismiss when Close button pressed', () => {
    const onDismissMock = jest.fn();
    const { getByText } = render(
      <Paper.PaperProvider>
        <ModalShowFollows {...baseProps} onDismiss={onDismissMock} />
      </Paper.PaperProvider>,
    );

    fireEvent.press(getByText('Close'));
    expect(onDismissMock).toHaveBeenCalled();
  });

  test('navigates to my page when target user is myself', () => {
    const myFollow = {
      id: 99,
      followerUserId: baseProps.userId,
      followedUserId: baseProps.userId,
      createdDate: new Date(),
      userName: 'Me',
    };

    const { getByText } = render(
      <Paper.PaperProvider>
        <ModalShowFollows {...baseProps} items={[myFollow]} />
      </Paper.PaperProvider>,
    );

    fireEvent.press(getByText('Me'));

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/(tabs)/(user)/user',
      params: { userId: baseProps.userId },
    });
  });
});
