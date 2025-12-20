import { FeedAlbum } from '../../../migrations/00006-createTableAlbums';
import { mockAlbum } from './testAlbumPhoto';
import { mockFullUser } from './testUser';

export const mockFeedAlbum: FeedAlbum = {
  id: mockAlbum.id,
  userId: mockFullUser.id,
  title: mockAlbum.title,
  description: mockAlbum.description,
  location: mockAlbum.location,
  createdDate: mockAlbum.createdDate,
  visibilityId: mockAlbum.visibilityId,
  name: mockFullUser.name,
  commentCount: 5,
  likeCount: 10,
};

// Edge / Fail pattern
export const mockFeedAlbumEdge: FeedAlbum = {
  ...mockFeedAlbum,
  description: null,
  location: null,
  commentCount: 0,
  likeCount: 0,
};
