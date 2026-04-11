import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import {
  GET,
  type IsFollowedResponseBodyGet,
} from '../../../../app/api/followed/[userId]+api';
import { getIsFollowed } from '../../../../database/followers';

// DB mock
jest.mock('../../../../database/followers', () => ({
  getIsFollowed: jest.fn(),
}));

function createTestApp() {
  const app = express();

  app.get('/api/isFollowed/:userId', async (req, res) => {
    const response = await GET(
      new Request(`http://localhost/api/isFollowed/${req.params.userId}`, {
        method: 'GET',
        headers: {
          cookie: req.headers.cookie || '',
        },
      }),
      { userId: req.params.userId },
    );

    res.status(response.status);
    response.headers.forEach((value: string, key: string) =>
      res.setHeader(key, value),
    );

    res.send(await response.text());
  });

  return app;
}

describe('GET /api/isFollowed/:userId', () => {
  const app = createTestApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns true if user is followed', async () => {
    (getIsFollowed as jest.Mock<any>).mockResolvedValue(true);

    const res = await request(app)
      .get('/api/isFollowed/1')
      .set('Cookie', 'sessionToken=valid-token')
      .expect(200);

    const body = res.body as IsFollowedResponseBodyGet;

    expect(body).toEqual({ result: true });
  });

  test('returns false if user is not followed', async () => {
    (getIsFollowed as jest.Mock<any>).mockResolvedValue(false);

    const res = await request(app)
      .get('/api/isFollowed/1')
      .set('Cookie', 'sessionToken=valid-token')
      .expect(200);

    const body = res.body as IsFollowedResponseBodyGet;

    expect(body).toEqual({ result: false });
  });

  test('returns 401 if no token', async () => {
    const res = await request(app).get('/api/isFollowed/1').expect(401);

    const body = res.body as IsFollowedResponseBodyGet;

    expect(body).toEqual({
      error: 'No session token found',
    });
  });
});
