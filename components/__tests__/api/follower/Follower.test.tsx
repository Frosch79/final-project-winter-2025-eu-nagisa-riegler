import express from 'express';
import request from 'supertest';
import {
  type FollowerUserResponseBodyGet,
  GET,
} from '../../../../app/api/follower/index+api';
import { getUserAllFollowersInsecure } from '../../../../database/followers';
import {
  followersOfUser1,
  mockFollowUser1,
} from '../../../../util/__tests__/__mock__/testFollows';

// DB mock
jest.mock('../../../../database/followers', () => ({
  getUserAllFollowersInsecure: jest.fn(),
}));

function createTestApp() {
  const app = express();

  app.get('/api/follower', async (req, res) => {
    const url = new URL(
      `http://localhost/api/follower?userId=${mockFollowUser1.followerUserId}`,
    );

    const response = await GET(new Request(url.toString()));

    res.status(response.status);
    response.headers.forEach((value: string, key: string) =>
      res.setHeader(key, value),
    );

    res.send(await response.text());
  });

  return app;
}

describe('GET /api/follower', () => {
  const app = createTestApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns follower users', async () => {
    (getUserAllFollowersInsecure as jest.Mock).mockResolvedValue(
      followersOfUser1,
    );

    const res = await request(app)
      .get('/api/follower')
      .query({ userId: 1 })
      .expect(200);

    const body = res.body as { user: FollowerUserResponseBodyGet };

    expect(body.user).toEqual(
      followersOfUser1.map((u) => ({
        ...u,
        createdDate: u.createdDate.toISOString(),
      })),
    );
  });

  it('returns 500 if DB returns undefined', async () => {
    (getUserAllFollowersInsecure as jest.Mock).mockResolvedValue(undefined);

    const res = await request(app)
      .get('/api/follower')
      .query({ userId: mockFollowUser1.followerUserId })
      .expect(500);

    const body = res.body as FollowerUserResponseBodyGet;

    expect(body).toEqual({
      error: 'Follower still does not created',
    });
  });
});
