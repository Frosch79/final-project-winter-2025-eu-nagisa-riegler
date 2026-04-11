import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import {
  GET,
  type UserFeedResponseBodyGet,
} from '../../../../app/api/feed/[feedId]+api';
import {
  getVisitUserAlbums,
  selectAlbumExists,
} from '../../../../database/albums';
import { mockFeedMyAlbums } from '../../../../util/__tests__/__mock__/testAlbumFeed';

jest.mock('../../../../database/albums', () => ({
  getVisitUserAlbums: jest.fn(),
  selectAlbumExists: jest.fn(),
}));

const feedId = 1;

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.get('/api/feed/:feedId', async (req, res) => {
    const response = await GET(
      new Request(`http://localhost/api/feed/${req.params.feedId}`, {
        headers: req.headers as any,
      }),
      { feedId: req.params.feedId },
    );
    res.status(response.status);
    response.headers.forEach((value: string, key: string) =>
      res.setHeader(key, value),
    );
    res.send(await response.text());
  });

  return app;
}

describe('GET /api/feed/:feedId', () => {
  const app = createTestApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns user albums successfully', async () => {
    (selectAlbumExists as jest.Mock<any>).mockResolvedValue(true);
    (getVisitUserAlbums as jest.Mock<any>).mockResolvedValue(mockFeedMyAlbums);

    const res = await request(app)
      .get(`/api/feed/${feedId}`)
      .set('Cookie', 'sessionToken=valid-token')
      .expect(200);

    const body = res.body as { album: UserFeedResponseBodyGet[] };
    expect(
      body.album.map((feed) => ({
        ...feed,
      })),
    ).toEqual(
      mockFeedMyAlbums.map((feed) => ({
        ...feed,
        createdDate: feed.createdDate.toISOString(),
      })),
    );
  });

  test('returns 401 if no token', async () => {
    const res = await request(app).get(`/api/feed/${feedId}`).expect(401);
    const body = res.body as { error: UserFeedResponseBodyGet };
    expect(body.error).toBe('No session token found');
  });

  test('returns 404 if album does not exist', async () => {
    (selectAlbumExists as jest.Mock<any>).mockResolvedValue(false);

    const res = await request(app)
      .get(`/api/feed/${feedId}`)
      .set('Cookie', 'sessionToken=valid-token')
      .expect(404);
    const body = res.body as { error: UserFeedResponseBodyGet };
    expect(body.error).toBe(`No album with id ${feedId} found `);
  });
});
