import type { FeedAlbum } from '../../../migrations/00006-createTableAlbums';
import { mockAlbum } from './testAlbumPhoto';
import { mockFullUser } from './testUser';

export const mockFeedMyAlbum: FeedAlbum = {
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

export const mockFeedMyAlbums: FeedAlbum[] = [
  {
    ...mockAlbum,
    id: 1,
    userId: mockFullUser.id,
    title: 'Mountain Adventure',
    description: 'Exploring the mountains',
    location: 'Norway',
    createdDate: new Date('2025-07-17T10:00:00.000Z'),
    visibilityId: 1,
    name: mockFullUser.name,
    commentCount: 3,
    likeCount: 7,
  },
  {
    ...mockAlbum,
    id: 2,
    userId: mockFullUser.id,
    title: 'City Lights',
    description: 'Night photography in the city',
    location: 'Tokyo',
    createdDate: new Date('2025-07-18T20:00:00.000Z'),
    visibilityId: 2,
    name: mockFullUser.name,
    commentCount: 8,
    likeCount: 15,
  },
  {
    ...mockAlbum,
    id: 3,
    userId: mockFullUser.id,
    title: 'Beach Sunset',
    description: 'Relaxing by the sea',
    location: 'Hawaii',
    createdDate: new Date('2025-07-19T18:30:00.000Z'),
    visibilityId: 3,
    name: mockFullUser.name,
    commentCount: 2,
    likeCount: 5,
  },
  {
    ...mockAlbum,
    id: 4,
    userId: mockFullUser.id,
    title: 'Forest Trails',
    description: 'Hiking in dense forests',
    location: 'Canada',
    createdDate: new Date('2025-07-20T09:15:00.000Z'),
    visibilityId: 1,
    name: mockFullUser.name,
    commentCount: 6,
    likeCount: 12,
  },
];
// Edge / Fail pattern
export const mockFeedAlbumEdge: FeedAlbum = {
  ...mockFeedMyAlbum,
  description: null,
  location: null,
  commentCount: 0,
  likeCount: 0,
};

export const otherUserAlbums: FeedAlbum[] = [
  {
    id: 201,
    userId: 20,
    title: 'Forest Adventure',
    description: 'Exploring the deep forest',
    location: 'Totoro Forest',
    createdDate: new Date('2025-08-01T08:00:00.000Z'),
    visibilityId: 1, // public
    name: 'Totoro',
    commentCount: 6,
    likeCount: 15,
  },
  {
    id: 202,
    userId: 21,
    title: 'Delivery Day',
    description: 'Flying across the city',
    location: 'Koriko',
    createdDate: new Date('2025-08-02T10:30:00.000Z'),
    visibilityId: 2, // private
    name: 'Kiki',
    commentCount: 3,
    likeCount: 9,
  },
  {
    id: 203,
    userId: 22,
    title: 'Castle Journey',
    description: 'Traveling with the moving castle',
    location: 'Ingary',
    createdDate: new Date('2025-08-03T14:45:00.000Z'),
    visibilityId: 3, // followers only
    name: 'Howl',
    commentCount: 7,
    likeCount: 18,
  },
  {
    id: 204,
    userId: 23,
    title: 'Ocean Flight',
    description: 'Flying above the sea',
    location: 'Adriatic Sea',
    createdDate: new Date('2025-08-04T07:15:00.000Z'),
    visibilityId: 1, // public
    name: 'Porco',
    commentCount: 5,
    likeCount: 12,
  },
];
