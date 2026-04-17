import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import {
  DELETE,
  GET,
  type PhotoResponseBodyDelete,
  type PhotoResponseBodyGet,
  type PhotoResponseBodyPut,
  PUT,
} from '../../../../app/api/photos/[photoId]+api';
import {
  deletePhoto,
  getPhoto,
  selectPhotoExists,
  updatePhoto,
} from '../../../../database/photos';
import { mockUserPhoto } from '../../../../util/__tests__/__mock__/testUserPhoto';

// DB mock
jest.mock('../../../../database/photos', () => ({
  getPhoto: jest.fn(),
  updatePhoto: jest.fn(),
  deletePhoto: jest.fn(),
  selectPhotoExists: jest.fn(),
}));

const photoId = '1';
const albumId = '1';

function createTestApp() {
  const app = express();
  app.use(express.json());

  // GET
  app.get('/api/photos/:photoId', async (req, res) => {
    const response = await GET(
      new Request(`http://localhost/api/photos/${req.params.photoId}`),
      { photoId: req.params.photoId },
    );

    res.status(response.status);
    response.headers.forEach((value: string, key: string) =>
      res.setHeader(key, value),
    );
    res.send(await response.text());
  });

  // PUT
  app.put('/api/photos/:photoId', async (req, res) => {
    const response = await PUT(
      new Request(`http://localhost/api/photos/${req.params.photoId}`, {
        method: 'PUT',
        headers: {
          cookie: req.headers.cookie || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      }),
      { photoId: req.params.photoId },
      { albumId },
    );

    res.status(response.status);
    response.headers.forEach((value: string, key: string) =>
      res.setHeader(key, value),
    );
    res.send(await response.text());
  });

  // DELETE
  app.delete('/api/photos/:photoId', async (req, res) => {
    const response = await DELETE(
      new Request(`http://localhost/api/photos/${req.params.photoId}`, {
        method: 'DELETE',
        headers: {
          cookie: req.headers.cookie || '',
        },
      }),
      { photoId: req.params.photoId },
      { albumId },
    );

    res.status(response.status);
    response.headers.forEach((value: string, key: string) =>
      res.setHeader(key, value),
    );
    res.send(await response.text());
  });

  return app;
}

describe('Photo Detail API', () => {
  const app = createTestApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/photos/:photoId', () => {
    test('returns photo successfully', async () => {
      (selectPhotoExists as jest.Mock<any>).mockResolvedValue(true);
      (getPhoto as jest.Mock<any>).mockResolvedValue(mockUserPhoto);

      const res = await request(app).get(`/api/photos/${photoId}`).expect(200);

      const body = res.body as { photo: PhotoResponseBodyGet };

      expect(body.photo).toEqual({
        ...mockUserPhoto,
        createdDate: mockUserPhoto.createdDate?.toISOString(),
      });
    });

    test('returns 404 if photo not exists', async () => {
      (selectPhotoExists as jest.Mock<any>).mockResolvedValue(false);

      const res = await request(app).get(`/api/photos/${photoId}`).expect(404);
      const body = res.body as { error: PhotoResponseBodyGet };
      expect(body.error).toBeDefined();
    });

    test('returns 403 if no access', async () => {
      (selectPhotoExists as jest.Mock<any>).mockResolvedValue(true);
      (getPhoto as jest.Mock<any>).mockResolvedValue(undefined);

      const res = await request(app).get(`/api/photos/${photoId}`).expect(403);
      const body = res.body as { error: PhotoResponseBodyGet };
      expect(body.error).toBeDefined();
    });
  });

  describe('PUT /api/photos/:photoId', () => {
    test('updates photo successfully', async () => {
      (selectPhotoExists as jest.Mock<any>).mockResolvedValue(true);
      (updatePhoto as jest.Mock<any>).mockResolvedValue([mockUserPhoto]);

      const res = await request(app)
        .put(`/api/photos/${photoId}`)
        .set('Cookie', 'sessionToken=valid-token')
        .send(mockUserPhoto)
        .expect(200);

      const body = res.body as { photo: PhotoResponseBodyPut };

      expect(body.photo).toEqual([
        {
          ...mockUserPhoto,
          createdDate: mockUserPhoto.createdDate?.toISOString(),
        },
      ]);
    });

    test('returns 400 if invalid body', async () => {
      const res = await request(app)
        .put(`/api/photos/${photoId}`)
        .set('Cookie', 'sessionToken=valid-token')
        .send({ title: 123 })
        .expect(400);
      const body = res.body as { error: PhotoResponseBodyPut };
      expect(body.error).toBeDefined();
    });

    test('returns 401 if no token', async () => {
      const res = await request(app)
        .put(`/api/photos/${photoId}`)
        .send(mockUserPhoto)
        .expect(401);
      const body = res.body as { error: PhotoResponseBodyPut };
      expect(body.error).toBe('No session token found');
    });

    test('returns 404 if photo not exists', async () => {
      (selectPhotoExists as jest.Mock<any>).mockResolvedValue(false);

      const res = await request(app)
        .put(`/api/photos/${photoId}`)
        .set('Cookie', 'sessionToken=valid-token')
        .send(mockUserPhoto)
        .expect(404);
      const body = res.body as { error: PhotoResponseBodyPut };
      expect(body.error).toBeDefined();
    });
  });

  describe('DELETE /api/photos/:photoId', () => {
    test('deletes photo successfully', async () => {
      (selectPhotoExists as jest.Mock<any>).mockResolvedValue(true);
      (deletePhoto as jest.Mock<any>).mockResolvedValue([mockUserPhoto]);

      const res = await request(app)
        .delete(`/api/photos/${photoId}`)
        .set('Cookie', 'sessionToken=valid-token')
        .expect(200);

      const body = res.body as { photo: PhotoResponseBodyDelete };

      expect(body.photo).toEqual([
        {
          ...mockUserPhoto,
          createdDate: mockUserPhoto.createdDate?.toISOString(),
        },
      ]);
    });

    test('returns 401 if no token', async () => {
      const res = await request(app)
        .delete(`/api/photos/${photoId}`)
        .expect(401);
      const body = res.body as { error: PhotoResponseBodyDelete };
      expect(body.error).toBe('No session token found');
    });

    test('returns 404 if photo not exists', async () => {
      (selectPhotoExists as jest.Mock<any>).mockResolvedValue(false);

      const res = await request(app)
        .delete(`/api/photos/${photoId}`)
        .set('Cookie', 'sessionToken=valid-token')
        .expect(404);
      const body = res.body as { error: PhotoResponseBodyDelete };
      expect(body.error).toBeDefined();
    });
  });
});
