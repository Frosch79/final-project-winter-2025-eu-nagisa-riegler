import express from 'express';
import request from 'supertest';
import {
  type AlbumResponseBodyDelete,
  type AlbumResponseBodyGet,
  type AlbumResponseBodyPut,
  DELETE,
  GET,
  PUT,
} from '../../../../app/api/albums/[albumId]+api';
import {
  deleteAlbum,
  getVisitUserAlbum,
  selectAlbumExists,
  updateAlbum,
} from '../../../../database/albums';
import { albumSchema } from '../../../../migrations/00006-createTableAlbums';

// DB mock
jest.mock('../../../../database/albums', () => ({
  selectAlbumExists: jest.fn(),
  getVisitUserAlbum: jest.fn(),
  updateAlbum: jest.fn(),
  deleteAlbum: jest.fn(),
}));

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.get('/api/albums/:albumId', async (req, res) => {
    const response = await GET(
      new Request('http://localhost/api/albums/' + req.params.albumId, {
        headers: { cookie: req.headers.cookie || '' },
      }),
      { albumId: req.params.albumId },
    );
    res.status(response.status);
    response.headers.forEach((value: string, key: string) =>
      res.setHeader(key, value),
    );
    res.send(await response.text());
  });

  app.put('/api/albums/:albumId', async (req, res) => {
    const response = await PUT(
      new Request('http://localhost/api/albums/' + req.params.albumId, {
        method: 'PUT',
        headers: {
          cookie: req.headers.cookie || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      }),
      { albumId: req.params.albumId },
    );
    res.status(response.status);
    response.headers.forEach((value: string, key: string) =>
      res.setHeader(key, value),
    );
    res.send(await response.text());
  });

  app.delete('/api/albums/:albumId', async (req, res) => {
    const response = await DELETE(
      new Request('http://localhost/api/albums/' + req.params.albumId, {
        method: 'DELETE',
        headers: { cookie: req.headers.cookie || '' },
      }),
      { albumId: req.params.albumId },
    );
    res.status(response.status);
    response.headers.forEach((value: string, key: string) =>
      res.setHeader(key, value),
    );
    res.send(await response.text());
  });

  return app;
}

describe('Album APIs (GET, PUT, DELETE)', () => {
  const app = createTestApp();
  const albumId = '1';
  const validBody = {
    title: 'trip',
    description: 'vienna trip',
    location: 'vienna',
    visibilityName: 'Public',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/albums/:albumId', () => {
    it('returns album successfully', async () => {
      (selectAlbumExists as jest.Mock).mockResolvedValue(true);
      (getVisitUserAlbum as jest.Mock).mockResolvedValue(validBody);

      const res = await request(app)
        .get(`/api/albums/${albumId}`)
        .set('Cookie', 'sessionToken=valid-token')
        .send(albumSchema)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = res.body as { album: AlbumResponseBodyGet };
      expect(body.album).toMatchObject(validBody);
    });

    it('returns 401 if no token', async () => {
      const res = await request(app).get(`/api/albums/${albumId}`).expect(401);
      const body = res.body as { error: AlbumResponseBodyGet };
      expect(body.error).toBe('No session token found');
    });
  });

  describe('PUT /api/albums/:albumId', () => {
    it('updates album successfully', async () => {
      (selectAlbumExists as jest.Mock).mockResolvedValue(true);
      (updateAlbum as jest.Mock).mockResolvedValue(validBody);

      const res = await request(app)
        .put(`/api/albums/${albumId}`)
        .set('Cookie', 'sessionToken=valid-token')
        .send(validBody)
        .expect(200);

      const body = res.body as { album: AlbumResponseBodyPut };
      expect(body.album).toMatchObject(validBody);
    });

    it('returns 400 on invalid body', async () => {
      const res = await request(app)
        .put(`/api/albums/${albumId}`)
        .set('Cookie', 'sessionToken=valid-token')
        .send({ title: 123 })
        .expect(400);

      const body = res.body as {
        error: AlbumResponseBodyPut;
        errorIssues: AlbumResponseBodyPut;
      };
      expect(body.error).toBeDefined();
      expect(Array.isArray(body.errorIssues)).toBe(true);
    });
  });

  describe('DELETE /api/albums/:albumId', () => {
    it('deletes album successfully', async () => {
      (selectAlbumExists as jest.Mock).mockResolvedValue(true);
      (deleteAlbum as jest.Mock).mockResolvedValue([{ title: 'Trip' }]);

      const res = await request(app)
        .delete(`/api/albums/${albumId}`)
        .set('Cookie', 'sessionToken=valid-token')
        .expect(200);

      const body = res.body as { album: AlbumResponseBodyDelete };
      expect(body.album).toEqual([{ title: 'Trip' }]);
    });

    it('returns 404 if album does not exist', async () => {
      (selectAlbumExists as jest.Mock).mockResolvedValue(false);

      const res = await request(app)
        .delete(`/api/albums/${albumId}`)
        .set('Cookie', 'sessionToken=valid-token')
        .expect(404);

      const body = res.body as { error: AlbumResponseBodyDelete };
      expect(body.error).toBe(`No album with id ${albumId} found `);
    });
  });
});
