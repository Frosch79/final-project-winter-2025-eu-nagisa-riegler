import express from 'express';
import request from 'supertest';
import {
  type AlbumCommentsResponseBodyGet,
  type CreateAlbumCommentResponseBodyPost,
  GET,
  POST,
} from '../../../../app/api/comments/index+api';
import {
  createComment,
  getAllAlbumComments,
} from '../../../../database/comments';
import { type Comment } from '../../../../migrations/00012-createTableComments';

// DB mock
jest.mock('../../../../database/comments', () => ({
  getAllAlbumComments: jest.fn(),
  createComment: jest.fn(),
}));

const albumId = 1;
const mockComment: Comment = {
  id: 1,
  userId: 1,
  albumId: albumId,
  content: 'Great album!',
  createdDate: new Date(),
};
function createTestApp() {
  const app = express();
  app.use(express.json());

  app.get('/api/comments', async (req, res) => {
    const url = new URL(`http://localhost/api/comments?album=${albumId}`);
    const response = await GET(new Request(url.toString()));
    res.status(response.status);
    response.headers.forEach((value: string, key: string) =>
      res.setHeader(key, value),
    );
    res.send(await response.text());
  });

  app.post('/api/comments', async (req, res) => {
    const response = await POST(
      new Request('http://localhost/api/comments', {
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

describe('Album Comments API', () => {
  const app = createTestApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/comments', () => {
    it('returns all comments for album', async () => {
      (getAllAlbumComments as jest.Mock).mockResolvedValue([mockComment]);

      const res = await request(app)
        .get('/api/comments')
        .query({ album: albumId })
        .expect('Content-Type', /json/)
        .expect(200);

      const body = res.body as { comment: AlbumCommentsResponseBodyGet };
      expect(body.comment).toEqual([
        { ...mockComment, createdDate: mockComment.createdDate.toISOString() },
      ]);
    });
  });

  describe('POST /api/comments', () => {
    it('creates comment successfully', async () => {
      (createComment as jest.Mock).mockResolvedValue([
        { ...mockComment, createdDate: mockComment.createdDate.toISOString() },
      ]);

      const res = await request(app)
        .post('/api/comments')
        .set('Cookie', 'sessionToken=valid-token')
        .send({ albumId: albumId, content: 'Great album!' })
        .expect('Content-Type', /json/)
        .expect(200);

      const body = res.body as { comment: CreateAlbumCommentResponseBodyPost };
      expect(body.comment).toEqual([
        { ...mockComment, createdDate: mockComment.createdDate.toISOString() },
      ]);
    });

    it('returns 400 on invalid body', async () => {
      const res = await request(app)
        .post('/api/comments')
        .set('Cookie', 'sessionToken=valid-token')
        .send({ albumId: 'wrong', content: 123 })
        .expect(400);

      const body = res.body as {
        error: CreateAlbumCommentResponseBodyPost;
        errorIssues: CreateAlbumCommentResponseBodyPost;
      };
      expect(body.error).toBeDefined();
      expect(Array.isArray(body.errorIssues)).toBe(true);
    });

    it('returns 401 if no token', async () => {
      const res = await request(app)
        .post('/api/comments')
        .send({ albumId: albumId, content: 'Test' })
        .expect(200);

      const body = res.body as { error: CreateAlbumCommentResponseBodyPost };
      expect(body.error).toBe('No session token found');
    });

    it('returns 500 if createComment fails', async () => {
      (createComment as jest.Mock).mockResolvedValue(undefined);

      const res = await request(app)
        .post('/api/comments')
        .set('Cookie', 'sessionToken=valid-token')
        .send({ albumId: albumId, content: 'Test' })
        .expect(500);

      const body = res.body as { error: CreateAlbumCommentResponseBodyPost };
      expect(body.error).toBeDefined();
    });
  });
});
