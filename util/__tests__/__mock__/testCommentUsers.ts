import type { CommentWithUserName } from '../../../database/comments';
import { kiki, totoro } from './testUser';

export const comments: CommentWithUserName[] = [
  {
    id: 1,
    albumId: 100,
    userId: totoro.id,
    name: totoro.name,
    content: 'This forest is very peaceful.',
    createdDate: new Date('2023-01-01'),
  },
  {
    id: 2,
    albumId: 100,
    userId: kiki.id,
    name: kiki.name,
    content: 'I love flying over this place!',
    createdDate: new Date('2023-01-02'),
  },
];

// variations
export const commentsEmpty: CommentWithUserName[] = [];
