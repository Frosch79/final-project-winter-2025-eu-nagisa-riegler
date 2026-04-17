import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import {
  type AlbumCommentResponseBodyDelete,
  DELETE,
} from '../../../../app/api/comments/[commentId]+api';
import {
  deleteComment,
  selectCommentExists,
} from '../../../../database/comments';
import type { Comment } from '../../../../migrations/00012-createTableComments';

// DB mock
jest.mock('../../../../database/comments', () => ({
  deleteComment: jest.fn(),
  selectCommentExists: jest.fn(),
}));

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.delete('/api/comments/:commentId', async (req, res) => {
    const response = await DELETE(
      new Request('http://localhost/api/comments/' + req.params.commentId, {
        method: 'DELETE',
        headers: { cookie: req.headers.cookie || '' },
      }),
      { commentId: req.params.commentId },
    );
    res.status(response.status);
    response.headers.forEach((value: string, key: string) =>
      res.setHeader(key, value),
    );
    res.send(await response.text());
  });

  return app;
}

const mockComment: Comment = {
  id: 1,
  albumId: 1,
  userId: 1,
  content: 'Great album!',
  createdDate: new Date(),
};

describe('DELETE /api/comments/:commentId', () => {
  const app = createTestApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deletes a comment successfully', async () => {
    (selectCommentExists as jest.Mock<any>).mockResolvedValue(true);
    (deleteComment as jest.Mock<any>).mockResolvedValue([mockComment]);

    const res = await request(app)
      .delete('/api/comments/1')
      .set('Cookie', 'sessionToken=valid-token')
      .expect('Content-Type', /json/)
      .expect(200);

    const body = res.body as { comment: AlbumCommentResponseBodyDelete };

    expect(body.comment).toEqual([
      { ...mockComment, createdDate: mockComment.createdDate.toISOString() },
    ]);
  });

  test('returns 401 if no token', async () => {
    const res = await request(app).delete('/api/comments/1').expect(401);
    const body = res.body as { error: AlbumCommentResponseBodyDelete };
    expect(body.error).toBe('No session token found');
  });

  test('returns 404 if comment does not exist', async () => {
    (selectCommentExists as jest.Mock<any>).mockResolvedValue(false);
    const res = await request(app)
      .delete('/api/comments/999')
      .set('Cookie', 'sessionToken=valid-token')
      .expect(404);
    const body = res.body as { error: AlbumCommentResponseBodyDelete };
    expect(body.error).toMatch(/No album with id 999 found/);
  });
});
