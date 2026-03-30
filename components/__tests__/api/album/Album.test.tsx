import express from 'express';
import request from 'supertest';
import {
  type CreateAlbumResponseBodyPost,
  POST,
} from '../../../../app/api/albums/index+api';
import { createAlbum } from '../../../../database/albums';

// DB mock
jest.mock('../../../../database/albums', () => ({
  createAlbum: jest.fn(),
}));

function createTestApp() {
  const app = express();
  app.use(express.json());

  // POST /api/albums
  app.post('/api/albums', async (req, res) => {
    const fakeRequest = new Request('http://localhost/api/albums', {
      method: 'POST',
      headers: {
        cookie: req.headers.cookie || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    try {
      const response = await POST(fakeRequest);
      res.status(response.status);
      response.headers.forEach((value: string, key: string) => {
        res.setHeader(key, value);
      });
      res.send(await response.text());
    } catch {
      res.status(500).json({ error: 'Internal test error' });
    }
  });

  return app;
}

const validBody = {
  title: 'trip',
  description: 'vienna trip',
  location: 'vienna',
  visibilityName: 'Public',
};

describe('POST /api/albums', () => {
  const app = createTestApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates album successfully', async () => {
    (createAlbum as jest.Mock).mockResolvedValue({
      id: 1,
      userId: 1,
      title: 'trip',
      description: 'vienna trip',
      location: 'vienna',
      visibilityId: 1,
    });

    const res = await request(app)
      .post('/api/albums')
      .set('Cookie', 'sessionToken=valid-token')
      .send(validBody)
      .expect('Content-Type', /json/)
      .expect(200);
    const body = res.body as { album: CreateAlbumResponseBodyPost };
    expect(body.album).toMatchObject({
      id: 1,
      userId: 1,
      title: 'trip',
      description: 'vienna trip',
      location: 'vienna',
      visibilityId: 1,
    });
  });

  it('returns 400 if body is invalid', async () => {
    const res = await request(app)
      .post('/api/albums')
      .set('Cookie', 'sessionToken=valid-token')
      .send({ title: 123 })
      .expect('Content-Type', /json/)
      .expect(400);
    const body = res.body as {
      error: CreateAlbumResponseBodyPost;
      errorIssues: CreateAlbumResponseBodyPost;
    };
    expect(body.error).toBeDefined();
    expect(Array.isArray(body.errorIssues)).toBe(true);
  });

  it('returns 401 if no token', async () => {
    const res = await request(app)
      .post('/api/albums')
      .send(validBody)
      .expect(401);
    const body = res.body as { error: CreateAlbumResponseBodyPost };
    expect(body.error).toBe('No session token found');
  });

  it('returns 500 if DB fails', async () => {
    (createAlbum as jest.Mock).mockResolvedValue(undefined);

    const res = await request(app)
      .post('/api/albums')
      .set('Cookie', 'sessionToken=valid-token')
      .send(validBody)
      .expect(500);
    const body = res.body as { error: CreateAlbumResponseBodyPost };
    expect(body.error).toBeDefined();
  });
});
