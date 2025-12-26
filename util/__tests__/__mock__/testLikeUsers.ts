import type { LikeUsers } from '../../../migrations/00010-createTableLikes';
import { howl, kiki, totoro } from './testUser';

export const likes: LikeUsers[] = [
  {
    id: 2,
    albumId: 100,
    userId: kiki.id,
    name: kiki.name,
    createdDate: new Date('2023-01-02'),
  },
  {
    id: 3,
    albumId: 100,
    userId: howl.id,
    name: howl.name,
    createdDate: new Date('2023-01-03'),
  },
];

// variations
export const likesEmpty: LikeUsers[] = [];
export const likesByTotoro: LikeUsers[] = [likes[0] as LikeUsers];
