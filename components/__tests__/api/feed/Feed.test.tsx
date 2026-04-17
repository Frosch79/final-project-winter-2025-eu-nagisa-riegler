import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import {
  type FeedResponseBodyGet,
  GET,
} from '../../../../app/api/feed/index+api';
import { getAlbumsSwitchWithVisibility } from '../../../../database/albums';
import { otherUserAlbums } from '../../../../util/__tests__/__mock__/testAlbumFeed';

jest.mock('../../../../database/albums', () => ({
  getAlbumsSwitchWithVisibility: jest.fn(),
}));

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.get('/api/feed', async (req, res) => {
    const url = new URL(`http://localhost/api/feed?visibility=public`);
    const response = await GET(
      new Request(url.toString(), { headers: req.headers as any }),
    );
    res.status(response.status);
    response.headers.forEach((value: string, key: string) =>
      res.setHeader(key, value),
    );
    res.send(await response.text());
  });

  return app;
}

describe('GET /api/feed', () => {
  const app = createTestApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns feed albums successfully', async () => {
    (getAlbumsSwitchWithVisibility as jest.Mock<any>).mockResolvedValue(
      otherUserAlbums,
    );

    const res = await request(app)
      .get('/api/feed')
      .set('Cookie', 'sessionToken=valid-token')
      .expect(200);

    const body = res.body as { feedAlbum: FeedResponseBodyGet[] };

    expect(
      body.feedAlbum.map((feed) => ({
        ...feed,
      })),
    ).toEqual(
      otherUserAlbums.map((feed) => ({
        ...feed,
        createdDate: feed.createdDate.toISOString(),
      })),
    );
  });

  test('returns 401 if no token', async () => {
    const res = await request(app).get('/api/feed').expect(200);
    const body = res.body as { error: FeedResponseBodyGet };

    expect(body.error).toBe('No session token found');
  });

  test('returns 500 if DB fails', async () => {
    (getAlbumsSwitchWithVisibility as jest.Mock<any>).mockResolvedValue(
      undefined,
    );

    const res = await request(app)
      .get('/api/feed')
      .set('Cookie', 'sessionToken=valid-token')
      .expect(500);
    const body = res.body as { error: FeedResponseBodyGet };
    expect(body.error).toBe('Album still does not created');
  });
});
