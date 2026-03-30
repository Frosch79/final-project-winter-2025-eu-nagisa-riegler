import type { UserPhoto } from '../../../migrations/00008-createTablePhotos';
import { mockAlbum } from './testAlbumPhoto';

export const mockUserPhoto: UserPhoto = {
  id: 1,
  albumId: mockAlbum.id,
  title: 'Sunset Flight',
  cloudinaryDataPath: 'https://example.com/photos/nausicaa.jpg',
  description: 'Nausicaä gliding during sunset',
  location: 'Valley of the Wind',
  createdDate: new Date('2025-07-20T18:30:00Z'),
};

export const mockUserPhotoEdge: UserPhoto = {
  id: null,
  albumId: null,
  title: null,
  cloudinaryDataPath: null,
  description: null,
  location: null,
  createdDate: null,
};
