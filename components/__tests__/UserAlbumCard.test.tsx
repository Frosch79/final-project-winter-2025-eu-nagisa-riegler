import { expect, jest } from '@jest/globals';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import * as Paper from 'react-native-paper';
import { paperMock } from '../../util/__tests__/__mock__/paperMock';
import { mockAlbumByUser } from '../../util/__tests__/__mock__/testAlbumByUser';
import { comments } from '../../util/__tests__/__mock__/testCommentUsers';
import { likes } from '../../util/__tests__/__mock__/testLikeUsers';
import { totoro } from '../../util/__tests__/__mock__/testUser';
import UserAlbumCard from '../UserAlbumCard';

// modal mock
const modal: React.FC<any> = (onDismiss) => {
  return (
    <>
      <Text testID="modal-dismiss" onPress={onDismiss}>
        Close
      </Text>
      <Text testID="modal-likes-true" onPress={onDismiss}>
        Like Modal
      </Text>
      <Text testID="modal-comment-true" onPress={onDismiss}>
        Comment Modal
      </Text>
    </>
  );
};

jest.mock('../ModalLike', () => {
  return jest.fn(({ visible, onDismiss }) => {
    return visible ? modal(onDismiss) : null;
  });
});

jest.mock('../ModalComment', () => {
  return jest.fn(({ visible, onDismiss }) => {
    return visible ? modal(onDismiss) : null;
  });
});

// import paper mock
paperMock();

const baseProps = {
  album: mockAlbumByUser,
  userId: 1,
  albumLikes: likes,
  albumComments: comments,
  onUpdateLike: jest.fn(),
  onUpdateComment: jest.fn(),
};

describe('UserAlbumCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders album title, description and location', () => {
    const { getByTestId } = render(
      <Paper.PaperProvider>
        <UserAlbumCard {...baseProps} />
      </Paper.PaperProvider>,
    );

    expect(getByTestId('album-title').props.children).toBe(
      baseProps.album.title,
    );
    expect(getByTestId('album-description').props.children).toBe(
      baseProps.album.description,
    );
    expect(getByTestId('album-location').props.children).toBe(
      baseProps.album.location,
    );
  });

  test('shows correct like and comment counts', () => {
    const { getByTestId } = render(
      <Paper.PaperProvider>
        <UserAlbumCard {...baseProps} />
      </Paper.PaperProvider>,
    );

    expect(getByTestId('likes-count').props.children).toBe(
      baseProps.albumLikes.length,
    );
    expect(getByTestId('comment-count').props.children).toBe(
      baseProps.albumComments.length,
    );
  });

  test('opens like modal when pressing show likes button', () => {
    const { getByTestId, queryByTestId } = render(
      <Paper.PaperProvider>
        <UserAlbumCard {...baseProps} />
      </Paper.PaperProvider>,
    );

    expect(queryByTestId('likes-modal-true')).toBeNull();
    fireEvent.press(getByTestId('likes-modal'));
    expect(getByTestId('modal-likes-true')).toBeTruthy();
  });

  test('opens comment modal when pressing show likes button', () => {
    const { getByTestId, queryByTestId } = render(
      <Paper.PaperProvider>
        <UserAlbumCard {...baseProps} />
      </Paper.PaperProvider>,
    );

    expect(queryByTestId('comment-modal-true')).toBeNull();
    fireEvent.press(getByTestId('comment-modal-icon-button'));
    expect(getByTestId('modal-comment-true')).toBeTruthy();
  });

  test('increments like count when like succeeds', async () => {
    const { getByTestId } = render(
      <Paper.PaperProvider>
        <UserAlbumCard {...baseProps} />
      </Paper.PaperProvider>,
    );
    fireEvent.press(getByTestId('likes-icon-button'));

    await waitFor(() => {
      expect(getByTestId('likes-count').props.children).toBe(
        baseProps.albumLikes.length + 1,
      );
    });

    expect(baseProps.onUpdateLike).toHaveBeenCalled();
  });

  test('decrements like count when like succeeds', async () => {
    const albumLiked = [
      ...baseProps.albumLikes,
      {
        id: 1,
        albumId: 100,
        userId: totoro.id,
        name: totoro.name,
        createdDate: new Date('2023-01-01'),
      },
    ];
    const { getByTestId } = render(
      <Paper.PaperProvider>
        <UserAlbumCard {...baseProps} albumLikes={albumLiked} />
      </Paper.PaperProvider>,
    );

    fireEvent.press(getByTestId('likes-icon-button'));

    await waitFor(() => {
      expect(getByTestId('likes-count').props.children).toBe(
        albumLiked.length - 1,
      );
    });

    expect(baseProps.onUpdateLike).toHaveBeenCalled();
  });
});
