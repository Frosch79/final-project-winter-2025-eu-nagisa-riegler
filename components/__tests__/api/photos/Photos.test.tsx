import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import {
  type CreatePhotoResponseBodyPost,
  GET,
  type PhotoResponseBodyGet,
  POST,
} from '../../../../app/api/photos/index+api';
import {
  createPhotoInAlbum,
  getAlbumPhotos,
} from '../../../../database/photos';
import {
  mockUserPhoto,
  mockUserPhotoEdge,
} from '../../../../util/__tests__/__mock__/testUserPhoto';

// DB mock
jest.mock('../../../../database/photos', () => ({
  getAlbumPhotos: jest.fn(),
  createPhotoInAlbum: jest.fn(),
}));

function createTestApp() {
  const app = express();
  app.use(express.json());

  // GET
  app.get('/api/photos', async (req, res) => {
    const url = new URL(
      `http://localhost/api/photos?album=${mockUserPhoto.albumId}`,
    );

    const response = await GET(
      new Request(url.toString(), {
        headers: {
          cookie: req.headers.cookie || '',
        },
      }),
    );

    res.status(response.status);
    response.headers.forEach((value: string, key: string) =>
      res.setHeader(key, value),
    );

    res.send(await response.text());
  });

  // POST
  app.post('/api/photos', async (req, res) => {
    const response = await POST(
      new Request('http://localhost/api/photos', {
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

  return app;
}

describe('Photo API', () => {
  const app = createTestApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/photos', () => {
    test('returns photo successfully', async () => {
      (getAlbumPhotos as jest.Mock<any>).mockResolvedValue(mockUserPhoto);

      const res = await request(app)
        .get('/api/photos')
        .query({ album: mockUserPhoto.albumId })
        .set('Cookie', 'sessionToken=valid-token')
        .expect('Content-Type', /json/);

      const body = res.body as { photo: PhotoResponseBodyGet };

      expect(body.photo).toEqual({
        ...mockUserPhoto,
        createdDate: mockUserPhoto.createdDate?.toISOString(),
      });
    });

    test('returns 401 if no token', async () => {
      const res = await request(app).get('/api/photos').expect(401);

      const body = res.body as { error: string };
      expect(body.error).toBe('No session token found');
    });

    test('returns 403 if no photo found', async () => {
      (getAlbumPhotos as jest.Mock<any>).mockResolvedValue(undefined);

      const res = await request(app)
        .get('/api/photos')
        .set('Cookie', 'sessionToken=valid-token')
        .query({ album: mockUserPhoto.albumId })

        .expect(403);

      const body = res.body as { error: string };
      expect(body.error).toBeDefined();
    });
  });

  describe('POST /api/photos', () => {
    test('creates photo successfully', async () => {
      (createPhotoInAlbum as jest.Mock<any>).mockResolvedValue(mockUserPhoto);

      const res = await request(app)
        .post('/api/photos')
        .set('Cookie', 'sessionToken=valid-token')
        .send(mockUserPhoto)
        .expect(200);

      const body = res.body as { photo: CreatePhotoResponseBodyPost };

      expect(body.photo).toEqual({
        ...mockUserPhoto,
        createdDate: mockUserPhoto.createdDate?.toISOString(),
      });
    });

    test('returns 400 if invalid body', async () => {
      const res = await request(app)
        .post('/api/photos')
        .set('Cookie', 'sessionToken=valid-token')
        .send(mockUserPhotoEdge)
        .expect(400);

      const body = res.body as {
        error: string;
        errorIssues: unknown[];
      };

      expect(body.error).toBeDefined();
      expect(Array.isArray(body.errorIssues)).toBe(true);
    });

    test('returns error if no token', async () => {
      const res = await request(app)
        .post('/api/photos')
        .send(mockUserPhoto)
        .expect(401);

      const body = res.body as { error: string };
      expect(body.error).toBe('No session token found');
    });

    test('returns 500 if create fails', async () => {
      (createPhotoInAlbum as jest.Mock<any>).mockResolvedValue(undefined);

      const res = await request(app)
        .post('/api/photos')
        .set('Cookie', 'sessionToken=valid-token')
        .send(mockUserPhoto)
        .expect(500);

      const body = res.body as { error: string };
      expect(body.error).toBeDefined();
    });
  });
});
