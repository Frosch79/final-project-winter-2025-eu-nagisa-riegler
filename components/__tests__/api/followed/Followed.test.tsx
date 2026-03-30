import express from 'express';
import request from 'supertest';
import {
  type CreateFollowResponseBodyPost,
  DELETE,
  type FollowedUserResponseBodyDelete,
  type FollowedUserResponseBodyGet,
  GET,
  POST,
} from '../../../../app/api/followed/index+api';
import {
  createFollow,
  deleteFollow,
  getIsFollowed,
  getUserAllFollowedInsecure,
} from '../../../../database/followers';
import {
  followersOfUser1,
  mockFollowUser1,
} from '../../../../util/__tests__/__mock__/testFollows';

jest.mock('../../../../database/followers', () => ({
  createFollow: jest.fn(),
  deleteFollow: jest.fn(),
  getIsFollowed: jest.fn(),
  getUserAllFollowedInsecure: jest.fn(),
}));

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.get('/api/followed', async (req, res) => {
    const response = await GET(
      new Request(
        `http://localhost/api/followed?userId=${mockFollowUser1.followerUserId}`,
      ),
    );
    res.status(response.status);
    response.headers.forEach((value: string, key: string) =>
      res.setHeader(key, value),
    );
    res.send(await response.text());
  });

  app.post('/api/followed', async (req, res) => {
    const response = await POST(
      new Request('http://localhost/api/followed', {
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

  app.delete('/api/followed', async (req, res) => {
    const response = await DELETE(
      new Request('http://localhost/api/followed', {
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

describe('Followed API', () => {
  const app = createTestApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/followed', () => {
    it('returns followed users', async () => {
      (getUserAllFollowedInsecure as jest.Mock).mockResolvedValue(
        followersOfUser1,
      );

      const res = await request(app).get('/api/followed').expect(200);

      const body = res.body as { user: FollowedUserResponseBodyGet };
      expect(body.user).toEqual(
        followersOfUser1.map((obj) => ({
          ...obj,
          createdDate: obj.createdDate.toISOString(),
        })),
      );
    });

    it('returns 500 if DB returns undefined', async () => {
      (getUserAllFollowedInsecure as jest.Mock).mockResolvedValue(undefined);

      const res = await request(app).get('/api/followed').expect(500);
      const body = res.body as { error: FollowedUserResponseBodyGet };
      expect(body.error).toBe('Album still does not created');
    });
  });

  describe('POST /api/followed', () => {
    it('creates follow successfully', async () => {
      (getIsFollowed as jest.Mock).mockResolvedValue(false);
      (createFollow as jest.Mock).mockResolvedValue(mockFollowUser1);

      const res = await request(app)
        .post('/api/followed')
        .set('Cookie', 'sessionToken=valid-token')
        .send({ followedId: mockFollowUser1.followedUserId })
        .expect(200);

      const body = res.body as { follow: CreateFollowResponseBodyPost };
      expect(body.follow).toEqual({
        ...mockFollowUser1,
        createdDate: mockFollowUser1.createdDate.toISOString(),
      });
    });

    it('returns 401 if no token', async () => {
      const res = await request(app)
        .post('/api/followed')
        .send({ followedId: mockFollowUser1.followerUserId });
      const body = res.body as { error: CreateFollowResponseBodyPost };
      expect(body.error).toBe('No session token found');
    });

    it('returns 404 if already followed', async () => {
      (getIsFollowed as jest.Mock).mockResolvedValue(true);

      const res = await request(app)
        .post('/api/followed')
        .set('Cookie', 'sessionToken=valid-token')
        .send({ followedId: mockFollowUser1.followedUserId })
        .expect(404);
      const body = res.body as { error: CreateFollowResponseBodyPost };
      expect(body.error).toContain('No user with id');
    });

    it('returns 400 on invalid body', async () => {
      const res = await request(app)
        .post('/api/followed')
        .set('Cookie', 'sessionToken=valid-token')
        .send({ followedId: 'wrong' })
        .expect(400);
      const body = res.body as {
        error: CreateFollowResponseBodyPost;
        errorIssues: CreateFollowResponseBodyPost;
      };
      expect(body.error).toBeDefined();
      expect(Array.isArray(body.errorIssues)).toBe(true);
    });

    it('returns 500 if createFollow fails', async () => {
      (getIsFollowed as jest.Mock).mockResolvedValue(false);
      (createFollow as jest.Mock).mockResolvedValue(undefined);

      const res = await request(app)
        .post('/api/followed')
        .set('Cookie', 'sessionToken=valid-token')
        .send({ followedId: mockFollowUser1.followedUserId })
        .expect(500);
      const body = res.body as { error: CreateFollowResponseBodyPost };
      expect(body.error).toBeDefined();
    });
  });

  describe('DELETE /api/followed', () => {
    it('unfollows user successfully', async () => {
      (getIsFollowed as jest.Mock).mockResolvedValue(true);
      (deleteFollow as jest.Mock).mockResolvedValue(mockFollowUser1);

      const res = await request(app)
        .delete('/api/followed')
        .set('Cookie', 'sessionToken=valid-token')
        .send({ followedId: mockFollowUser1.followedUserId })
        .expect(200);

      const body = res.body as { follow: FollowedUserResponseBodyDelete };
      expect(body.follow).toEqual({
        ...mockFollowUser1,
        createdDate: mockFollowUser1.createdDate.toISOString(),
      });
    });

    it('returns 401 if no token', async () => {
      const res = await request(app)
        .delete('/api/followed')
        .send({ followedId: mockFollowUser1.followedUserId });
      const body = res.body as { error: FollowedUserResponseBodyDelete };
      expect(body.error).toBe('No session token found');
    });

    it('returns 404 if not followed', async () => {
      (getIsFollowed as jest.Mock).mockResolvedValue(false);

      const res = await request(app)
        .delete('/api/followed')
        .set('Cookie', 'sessionToken=valid-token')
        .send({ followedId: mockFollowUser1.followedUserId })
        .expect(404);
      const body = res.body as { error: FollowedUserResponseBodyDelete };
      expect(body.error).toContain('No user with id');
    });

    it('returns 400 on invalid body', async () => {
      const res = await request(app)
        .delete('/api/followed')
        .set('Cookie', 'sessionToken=valid-token')
        .send({ followedId: 'wrong' })
        .expect(400);
      const body = res.body as {
        error: FollowedUserResponseBodyDelete;
        errorIssues: FollowedUserResponseBodyDelete;
      };
      expect(body.error).toBeDefined();
      expect(Array.isArray(body.errorIssues)).toBe(true);
    });

    it('returns 403 if deleteFollow fails', async () => {
      (getIsFollowed as jest.Mock).mockResolvedValue(true);
      (deleteFollow as jest.Mock).mockResolvedValue(undefined);

      const res = await request(app)
        .delete('/api/followed')
        .set('Cookie', 'sessionToken=valid-token')
        .send({ followedId: mockFollowUser1.followedUserId })
        .expect(403);
      const body = res.body as { error: FollowedUserResponseBodyDelete };
      expect(body.error).toBeDefined();
    });
  });
});
