import { expect, jest } from '@jest/globals';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Paper from 'react-native-paper';
import { mockNavigate } from '../../jest.setup';
import { paperMock } from '../../util/__tests__/__mock__/paperMock';
import {
  comments,
  commentsEmpty,
} from '../../util/__tests__/__mock__/testCommentUsers';
import { kiki, totoro } from '../../util/__tests__/__mock__/testUser';
import ModalComment from '../ModalComment';

const baseProps = {
  visible: true,
  onDismiss: jest.fn(),
  albumId: 100,
  userId: kiki.id,
  comments,
  onUpdateComment: jest.fn(),
};

paperMock();

describe('ModalComment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders comments and content', () => {
    const { getByText } = render(
      <Paper.PaperProvider>
        <ModalComment {...baseProps} />
      </Paper.PaperProvider>,
    );

    for (const comment of comments) {
      expect(getByText(comment.name)).toBeTruthy();
      expect(getByText(comment.content)).toBeTruthy();
    }
  });

  test('renders "No comments" when comments is empty', () => {
    const { getByTestId } = render(
      <Paper.PaperProvider>
        <ModalComment {...baseProps} comments={commentsEmpty} />
      </Paper.PaperProvider>,
    );

    expect(getByTestId('no-comments')).toBeTruthy();
  });

  test('shows delete button only for own comment', () => {
    const { getAllByTestId, queryAllByTestId } = render(
      <Paper.PaperProvider>
        <ModalComment {...baseProps} userId={kiki.id} />
      </Paper.PaperProvider>,
    );

    // kiki has one comment → delete button exists
    expect(getAllByTestId('delete-button').length).toBe(1);

    // totoro comment should not have delete button
    expect(queryAllByTestId('delete-button').length).toBe(1);
  });

  test('shows error when sending empty comment', async () => {
    const { getByTestId } = render(
      <Paper.PaperProvider>
        <ModalComment {...baseProps} />
      </Paper.PaperProvider>,
    );

    fireEvent.press(getByTestId('send-button'));

    await waitFor(() => {
      expect(getByTestId('error-message')).toBeTruthy();
    });
  });

  test('calls onUpdateComment after successful comment post', async () => {
    const { getByTestId } = render(
      <Paper.PaperProvider>
        <ModalComment {...baseProps} />
      </Paper.PaperProvider>,
    );

    fireEvent.changeText(getByTestId('comment-input'), 'Nice photo!');
    fireEvent.press(getByTestId('send-button'));

    await waitFor(() => {
      expect(baseProps.onUpdateComment).toHaveBeenCalled();
    });
  });

  test('navigates to correct profile on user press', () => {
    const { getByText } = render(
      <Paper.PaperProvider>
        <ModalComment {...baseProps} />
      </Paper.PaperProvider>,
    );

    fireEvent.press(getByText(totoro.name));

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/(tabs)/(user)/[userId]',
      params: { userId: totoro.id },
    });
  });

  test('calls onDismiss when Close pressed', () => {
    const onDismissMock = jest.fn();

    const { getByTestId } = render(
      <Paper.PaperProvider>
        <ModalComment {...baseProps} onDismiss={onDismissMock} />
      </Paper.PaperProvider>,
    );

    fireEvent.press(getByTestId('close-button'));

    expect(onDismissMock).toHaveBeenCalled();
  });
});
