import { FollowUser } from '../../../database/followers';

export const mockFollowUser1: FollowUser = {
  id: 1,
  followerUserId: 2,
  followedUserId: 1,
  createdDate: new Date('2025-01-01'),
  userName: 'Mei',
};

export const mockFollowUser2: FollowUser = {
  id: 2,
  followerUserId: 3,
  followedUserId: 1,
  createdDate: new Date('2025-01-02'),
  userName: 'Satsuki',
};
