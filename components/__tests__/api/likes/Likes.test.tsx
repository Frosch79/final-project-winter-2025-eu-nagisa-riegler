import express from 'express';
import request from 'supertest';
import {
  type AlbumLikeResponseBodyDelete,
  type AlbumLikesResponseBodyGet,
  type CreateAlbumLikeResponseBodyPost,
  DELETE,
  GET,
  POST,
} from '../../../../app/api/likes/index+api';
import {
  createLike,
  deleteLike,
  getAllAlbumLikesInsecure,
  selectLikeExists,
} from '../../../../database/likes';
import {
  likes,
  likesEmpty,
} from '../../../../util/__tests__/__mock__/testLikeUsers';

// DB mock
jest.mock('../../../../database/likes', () => ({
  getAllAlbumLikesInsecure: jest.fn(),
  createLike: jest.fn(),
  deleteLike: jest.fn(),
  selectLikeExists: jest.fn(),
}));

const albumId = 100;

function createTestApp() {
  const app = express();
  app.use(express.json());

  // GET
  app.get('/api/likes', async (req, res) => {
    const url = new URL(`http://localhost/api/likes?album=${albumId}`);
    const response = await GET(new Request(url.toString()));

    res.status(response.status);
    response.headers.forEach((value: string, key: string) =>
      res.setHeader(key, value),
    );

    res.send(await response.text());
  });

  // POST
  app.post('/api/likes', async (req, res) => {
    const response = await POST(
      new Request('http://localhost/api/likes', {
        method: 'POST',
        headers: {
          cookie: req.headers.cookie || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      }),
    );

    res.status(response.status);
    response.headers.forEach((value: string, key: string) =>
      res.setHeader(key, value),
    );

    res.send(await response.text());
  });

  // DELETE
  app.delete('/api/likes', async (req, res) => {
    const response = await DELETE(
      new Request('http://localhost/api/likes', {
        method: 'DELETE',
        headers: {
          cookie: req.headers.cookie || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      }),
    );

    res.status(response.status);
    response.headers.forEach((value: string, key: string) =>
      res.setHeader(key, value),
    );

    res.send(await response.text());
  });

  return app;
}

describe('Album Likes API', () => {
  const app = createTestApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/likes', () => {
    it('returns all likes', async () => {
      (getAllAlbumLikesInsecure as jest.Mock).mockResolvedValue(likes);

      const res = await request(app)
        .get('/api/likes')
        .query({ album: albumId })
        .expect(200);

      const body = res.body as { like: AlbumLikesResponseBodyGet };

      expect(body.like).toEqual(
        likes.map((obj) => ({
          ...obj,
          createdDate: obj.createdDate.toISOString(),
        })),
      );
    });

    it('returns 500 if undefined', async () => {
      (getAllAlbumLikesInsecure as jest.Mock).mockResolvedValue(undefined);

      const res = await request(app).get('/api/likes').expect(500);

      const body = res.body as { error: string };
      expect(body.error).toBeDefined();
    });
  });

  describe('POST /api/likes', () => {
    it('creates like successfully', async () => {
      (selectLikeExists as jest.Mock).mockResolvedValue(false);
      (createLike as jest.Mock).mockResolvedValue(likesEmpty);

      const res = await request(app)
        .post('/api/likes')
        .set('Cookie', 'sessionToken=valid-token')
        .send({ albumId })
        .expect(200);

      const body = res.body as { like: CreateAlbumLikeResponseBodyPost };

      expect(body.like).toBeDefined();
    });

    it('returns 400 if invalid body', async () => {
      const res = await request(app)
        .post('/api/likes')
        .set('Cookie', 'sessionToken=valid-token')
        .send({ albumId: 'wrong' })
        .expect(400);

      const body = res.body as {
        error: string;
        errorIssues: unknown[];
      };

      expect(body.error).toBeDefined();
      expect(Array.isArray(body.errorIssues)).toBe(true);
    });

    it('returns error if no token', async () => {
      const res = await request(app)
        .post('/api/likes')
        .send({ albumId })
        .expect(401);

      const body = res.body as { error: string };

      expect(body.error).toBe('No session token found');
    });

    it('returns 404 if already liked', async () => {
      (selectLikeExists as jest.Mock).mockResolvedValue(true);

      const res = await request(app)
        .post('/api/likes')
        .set('Cookie', 'sessionToken=valid-token')
        .send({ albumId })
        .expect(404);

      const body = res.body as { error: string };
      expect(body.error).toBeDefined();
    });

    it('returns 500 if createLike fails', async () => {
      (selectLikeExists as jest.Mock).mockResolvedValue(false);
      (createLike as jest.Mock).mockResolvedValue(undefined);

      const res = await request(app)
        .post('/api/likes')
        .set('Cookie', 'sessionToken=valid-token')
        .send({ albumId })
        .expect(500);

      const body = res.body as { error: string };
      expect(body.error).toBeDefined();
    });
  });

  describe('DELETE /api/likes', () => {
    it('deletes like successfully', async () => {
      (selectLikeExists as jest.Mock).mockResolvedValue(true);
      (deleteLike as jest.Mock).mockResolvedValue(likesEmpty);

      const res = await request(app)
        .delete('/api/likes')
        .set('Cookie', 'sessionToken=valid-token')
        .send({ albumId })
        .expect(200);

      const body = res.body as { like: AlbumLikeResponseBodyDelete };
      expect(body.like).toBeDefined();
    });

    it('returns 400 if invalid body', async () => {
      const res = await request(app)
        .delete('/api/likes')
        .set('Cookie', 'sessionToken=valid-token')
        .send({ albumId: 'wrong' })
        .expect(400);

      const body = res.body as { error: string };
      expect(body.error).toBeDefined();
    });

    it('returns 401 if no token', async () => {
      const res = await request(app)
        .delete('/api/likes')
        .send({ albumId })
        .expect(401);

      const body = res.body as { error: string };
      expect(body.error).toBe('No session token found');
    });

    it('returns 404 if like does not exist', async () => {
      (selectLikeExists as jest.Mock).mockResolvedValue(false);

      const res = await request(app)
        .delete('/api/likes')
        .set('Cookie', 'sessionToken=valid-token')
        .send({ albumId })
        .expect(404);

      const body = res.body as { error: string };
      expect(body.error).toBeDefined();
    });

    it('returns 403 if delete fails', async () => {
      (selectLikeExists as jest.Mock).mockResolvedValue(true);
      (deleteLike as jest.Mock).mockResolvedValue(undefined);

      const res = await request(app)
        .delete('/api/likes')
        .set('Cookie', 'sessionToken=valid-token')
        .send({ albumId })
        .expect(403);

      const body = res.body as { error: string };
      expect(body.error).toBeDefined();
    });
  });
});
