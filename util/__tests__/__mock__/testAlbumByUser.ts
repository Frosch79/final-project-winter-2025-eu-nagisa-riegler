import { AlbumByUser } from '../../../database/albums';
import { mockAlbum } from './testAlbumPhoto';
import { mockFullUser } from './testUser';
import { mockUserPhoto, mockUserPhotoEdge } from './testUserPhoto';

export const mockAlbumByUser: AlbumByUser = {
  id: mockAlbum.id,
  userId: mockFullUser.id,
  title: mockAlbum.title,
  description: mockAlbum.description,
  location: mockAlbum.location,
  createdDate: mockAlbum.createdDate,
  visibilityId: mockAlbum.visibilityId,
  userName: mockFullUser.name,
  visibilityName: 'Public',
  photos: [mockUserPhoto, mockUserPhotoEdge],
};
