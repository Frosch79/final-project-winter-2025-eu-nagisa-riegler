import { expect, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import * as Paper from 'react-native-paper';
import { mockNavigate } from '../../jest.setup';
import { likes, likesEmpty } from '../../util/__tests__/__mock__/testLikeUsers';
import { howl, kiki } from '../../util/__tests__/__mock__/testUser';
import ModalLike from '../ModalLike';

const baseProps = {
  visible: true,
  onDismiss: jest.fn(),
  likes,
  userId: kiki.id,
};

describe('ModalLike', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders modal title and like users', () => {
    const { getByTestId, getByText } = render(
      <Paper.PaperProvider>
        <ModalLike {...baseProps} />
      </Paper.PaperProvider>,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(getByTestId('modal-title').props.children).toBe('Likes');

    for (const user of likes) {
      expect(getByText(user.name)).toBeTruthy();
    }
  });

  test('renders "No likes" when likes is empty', () => {
    const { getByTestId } = render(
      <Paper.PaperProvider>
        <ModalLike {...baseProps} likes={likesEmpty} />
      </Paper.PaperProvider>,
    );

    expect(getByTestId('no-likes')).toBeTruthy();
  });

  test('navigates to own profile when userId matches', () => {
    const { getByText } = render(
      <Paper.PaperProvider>
        <ModalLike {...baseProps} userId={kiki.id} />
      </Paper.PaperProvider>,
    );

    fireEvent.press(getByText(kiki.name));

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/(tabs)/(user)/user',
      params: { userId: kiki.id },
    });
  });

  test('navigates to other user profile when userId does not match', () => {
    const { getByText } = render(
      <Paper.PaperProvider>
        <ModalLike {...baseProps} userId={kiki.id} />
      </Paper.PaperProvider>,
    );

    fireEvent.press(getByText(howl.name));

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/(tabs)/(user)/[userId]',
      params: { userId: howl.id },
    });
  });

  test('calls onDismiss when Close button pressed', () => {
    const onDismissMock = jest.fn();

    const { getByTestId } = render(
      <Paper.PaperProvider>
        <ModalLike {...baseProps} onDismiss={onDismissMock} />
      </Paper.PaperProvider>,
    );

    fireEvent.press(getByTestId('close-button'));

    expect(onDismissMock).toHaveBeenCalled();
  });
});
