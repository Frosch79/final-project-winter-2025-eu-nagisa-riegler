import { FollowUser } from '../../../database/followers';

export const mockFollowUser1: FollowUser = {
  id: 1,
  followerUserId: 1,
  followedUserId: 3,
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

export const followersOfUser1: FollowUser[] = [
  {
    id: 1,
    followerUserId: 2,
    followedUserId: 1,
    createdDate: new Date('2025-01-01'),
    userName: 'Mei',
  },
  {
    id: 2,
    followerUserId: 3,
    followedUserId: 1,
    createdDate: new Date('2025-01-02'),
    userName: 'Satsuki',
  },
  {
    id: 3,
    followerUserId: 4,
    followedUserId: 1,
    createdDate: new Date('2025-01-03'),
    userName: 'Totoro',
  },
  {
    id: 4,
    followerUserId: 5,
    followedUserId: 1,
    createdDate: new Date('2025-01-04'),
    userName: 'Kiki',
  },
  {
    id: 5,
    followerUserId: 6,
    followedUserId: 1,
    createdDate: new Date('2025-01-05'),
    userName: 'Howl',
  },
];

export const followedByUser1: FollowUser[] = [
  {
    id: 6,
    followerUserId: 1,
    followedUserId: 7,
    createdDate: new Date('2025-01-01'),
    userName: 'Chihiro',
  },
  {
    id: 7,
    followerUserId: 1,
    followedUserId: 8,
    createdDate: new Date('2025-01-02'),
    userName: 'Haku',
  },
  {
    id: 8,
    followerUserId: 1,
    followedUserId: 9,
    createdDate: new Date('2025-01-03'),
    userName: 'Ponyo',
  },
  {
    id: 9,
    followerUserId: 1,
    followedUserId: 10,
    createdDate: new Date('2025-01-04'),
    userName: 'San',
  },
  {
    id: 10,
    followerUserId: 1,
    followedUserId: 11,
    createdDate: new Date('2025-01-05'),
    userName: 'Ashitaka',
  },
];
