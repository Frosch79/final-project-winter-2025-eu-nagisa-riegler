import { expect, jest } from '@jest/globals';
import {
  fireEvent,
  render,
  waitFor,
  within,
} from '@testing-library/react-native';
import { Text } from 'react-native';
import * as Paper from 'react-native-paper';
import { mockNavigate } from '../../jest.setup';
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
  return jest.fn(
    ({ visible, onDismiss }: { visible: boolean; onDismiss: boolean }) => {
      return visible ? modal(onDismiss) : null;
    },
  );
});

jest.mock('../ModalComment', () => {
  return jest.fn(
    ({ visible, onDismiss }: { visible: boolean; onDismiss: boolean }) => {
      return visible ? modal(onDismiss) : null;
    },
  );
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

export const edgeProps = {
  album: {
    ...mockAlbumByUser,
    location: '',
    description: '',
  },
  userId: 999, // album.userId is not same
  albumLikes: [],
  albumComments: [],
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

    const title = getByTestId('album-title');
    expect(within(title).getByText(baseProps.album.title)).toBeTruthy();

    const description = getByTestId('album-description');
    expect(
      within(description).getByText(baseProps.album.description ?? ''),
    ).toBeTruthy();

    const location = getByTestId('album-location');
    expect(
      within(location).getByText(baseProps.album.location ?? ''),
    ).toBeTruthy();
  });

  test('shows correct like and comment counts', () => {
    const { getByTestId } = render(
      <Paper.PaperProvider>
        <UserAlbumCard {...baseProps} />
      </Paper.PaperProvider>,
    );

    const likesCount = getByTestId('likes-count');
    expect(
      within(likesCount).getByText(`${baseProps.albumLikes.length}`),
    ).toBeTruthy();

    const commentCount = getByTestId('comment-count');
    expect(
      within(commentCount).getByText(`${baseProps.albumComments.length}`),
    ).toBeTruthy();
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

  test('opens comment modal when pressing show comment button', () => {
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
      const likesCount = getByTestId('likes-count');
      const likesText = within(likesCount).getByText(
        `${baseProps.albumLikes.length + 1}`,
      );
      expect(likesText).toBeTruthy();

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/likes',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ albumId: mockAlbumByUser.id }),
        }),
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
      const likesCount = getByTestId('likes-count');
      const likesText = within(likesCount).getByText(
        `${albumLiked.length - 1}`,
      );
      expect(likesText).toBeTruthy();
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/likes',
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({ albumId: mockAlbumByUser.id }),
        }),
      );
    });

    expect(baseProps.onUpdateLike).toHaveBeenCalled();
  });

  test('navigation to user page', () => {
    const { getByTestId } = render(
      <Paper.PaperProvider>
        <UserAlbumCard {...baseProps} />
      </Paper.PaperProvider>,
    );
    fireEvent.press(getByTestId('route'));

    expect(mockNavigate).toHaveBeenCalledWith({
      params: { userId: baseProps.album.userId },
      pathname:
        baseProps.userId === baseProps.album.userId && '/(tabs)/(user)/user',
    });
  });
});

describe('UserAlbumCard edge case', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders album title, description and location if that is empty comment', () => {
    const { queryByTestId } = render(
      <Paper.PaperProvider>
        <UserAlbumCard {...edgeProps} />
      </Paper.PaperProvider>,
    );

    const descriptionContainer = queryByTestId('album-description');
    expect(descriptionContainer).not.toBeNull();

    if (descriptionContainer) {
      const description = within(descriptionContainer).getByText('');
      expect(description).toBeTruthy();
    }

    const locationContainer = queryByTestId('album-location');
    expect(locationContainer).not.toBeNull();

    if (locationContainer) {
      const location = within(locationContainer).getByText('');
      expect(location).toBeTruthy();
    }
  });

  test('shows correct like and comment counts if nobody liked or commented', () => {
    const { queryByTestId } = render(
      <Paper.PaperProvider>
        <UserAlbumCard {...edgeProps} />
      </Paper.PaperProvider>,
    );

    const likesCount = queryByTestId('likes-count');
    expect(likesCount).not.toBeNull();
    if (likesCount) {
      const likesText = within(likesCount).getByText('0');
      expect(likesText).toBeTruthy();
    }

    const commentCount = queryByTestId('comment-count');
    expect(commentCount).not.toBeNull();
    if (commentCount) {
      const commentText = within(commentCount).getByText('0');
      expect(commentText).toBeTruthy();
    }
  });

  test('navigation to user page', () => {
    const { getByTestId } = render(
      <Paper.PaperProvider>
        <UserAlbumCard {...edgeProps} />
      </Paper.PaperProvider>,
    );
    fireEvent.press(getByTestId('route'));

    expect(mockNavigate).toHaveBeenCalledWith({
      params: { userId: edgeProps.album.userId },
      pathname:
        edgeProps.userId !== edgeProps.album.userId &&
        '/(tabs)/(user)/[userId]',
    });
  });
});

describe('UserAlbumCard fail cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows error when like API fails', async () => {
    // make fetch to fail
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Error updating like' }),
      } as Response),
    );

    const { getByTestId } = render(
      <Paper.PaperProvider>
        <UserAlbumCard {...baseProps} />
      </Paper.PaperProvider>,
    );

    fireEvent.press(getByTestId('likes-icon-button'));

    await waitFor(() => {
      const errorText = within(getByTestId('error-text')).getByText(
        'Error updating like',
      );
      expect(errorText).toBeTruthy();
    });

    // onUpdateLike is not called
    expect(baseProps.onUpdateLike).not.toHaveBeenCalled();
  });

  test('handles empty albumLikes and albumComments gracefully', () => {
    const edgePropsEmpty = {
      ...baseProps,
      albumLikes: [],
      albumComments: [],
      album: { ...baseProps.album, location: '' },
    };

    const { getByTestId } = render(
      <Paper.PaperProvider>
        <UserAlbumCard {...edgePropsEmpty} />
      </Paper.PaperProvider>,
    );

    const likesCount = within(getByTestId('likes-count')).getByText('0');
    expect(likesCount).toBeTruthy();

    const commentCount = within(getByTestId('comment-count')).getByText('0');
    expect(commentCount).toBeTruthy();
  });
});
