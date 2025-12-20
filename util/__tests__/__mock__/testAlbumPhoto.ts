import { Album } from '../../../migrations/00006-createTableAlbums';
import { Photo } from '../../../migrations/00008-createTablePhotos';
import { mockFullUser } from './testUser';

export const mockAlbum: Album = {
  id: 1,
  userId: mockFullUser.id,
  title: 'Valley of the Wind',
  description: 'A beautiful album',
  location: 'Japan',
  createdDate: new Date('2025-07-20'),
  visibilityId: 1,
};

export const mockPhoto: Photo = {
  id: 1,
  albumId: mockAlbum.id,
  title: 'Sunset Flight',
  cloudinaryDataPath: 'https://example.com/photos/nausicaa.jpg',
  description: 'Nausicaä gliding during sunset',
  location: 'Valley of the Wind',
  createdDate: new Date('2025-07-20T18:30:00Z'),
};
