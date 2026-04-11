import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import {
  GET,
  PUT,
  type UserResponseBodyGet,
  type UserResponseBodyPut,
} from '../../../app/api/user+api';
import { getUser, updateUser } from '../../../database/users';
import {
  mockFailUser,
  mockFullUser,
  mockUpdateUser,
} from '../../../util/__tests__/__mock__/testUser';

jest.mock('../../../database/users', () => ({
  getUser: jest.fn(),
  updateUser: jest.fn(),
}));

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.get('/api/user', async (req, res) => {
    const response = await GET(
      new Request('http://localhost/api/user', {
        headers: { cookie: req.headers.cookie || '' },
      }),
    );
    res.status(response.status);
    response.headers.forEach((value: string, key: string) =>
      res.setHeader(key, value),
    );
    res.send(await response.text());
  });

  app.put('/api/user', async (req, res) => {
    const response = await PUT(
      new Request('http://localhost/api/user', {
        method: 'PUT',
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

describe('User API', () => {
  const app = createTestApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/user', () => {
    test('returns user successfully', async () => {
      (getUser as jest.Mock<any>).mockResolvedValue(mockFullUser);

      const res = await request(app)
        .get('/api/user')
        .set('Cookie', 'sessionToken=valid-token')
        .expect(200);

      const body = res.body as { user: UserResponseBodyGet };
      expect(body.user).toEqual({
        ...mockFullUser,
        createdDate: mockFullUser.createdDate.toISOString(),
        birthday: mockFullUser.birthday.toISOString(),
      });
    });

    test('returns 401 if no token', async () => {
      const res = await request(app).get('/api/user').expect(401);
      const body = res.body as { error: UserResponseBodyGet };
      expect(body.error).toBe('No session token found');
    });

    test('returns error if user not found', async () => {
      (getUser as jest.Mock<any>).mockResolvedValue(undefined);

      const res = await request(app)
        .get('/api/user')
        .set('Cookie', 'sessionToken=valid-token')
        .expect(402);
      const body = res.body as { error: UserResponseBodyGet };
      expect(body.error).toBe('User not found');
    });
  });

  describe('PUT /api/user', () => {
    test('updates user successfully', async () => {
      (updateUser as jest.Mock<any>).mockResolvedValue(mockUpdateUser);

      const res = await request(app)
        .put('/api/user')
        .set('Cookie', 'sessionToken=valid-token')
        .send(mockUpdateUser)
        .expect(200);

      const body = res.body as { user: UserResponseBodyPut };
      expect(body.user).toEqual(mockUpdateUser);
    });

    test('returns 400 if invalid body', async () => {
      const res = await request(app)
        .put('/api/user')
        .set('Cookie', 'sessionToken=valid-token')
        .send(mockFailUser)
        .expect(400);
      const body = res.body as {
        error: UserResponseBodyPut;
        errorIssues: UserResponseBodyPut;
      };
      expect(body.error).toBe('Request does not contain user object');
      expect(Array.isArray(body.errorIssues)).toBe(true);
    });

    test('returns 401 if no token', async () => {
      const res = await request(app)
        .put('/api/user')
        .send(mockUpdateUser)
        .expect(401);
      const body = res.body as { error: UserResponseBodyPut };
      expect(body.error).toBe('No session token found');
    });

    test('returns error if update fails', async () => {
      (updateUser as jest.Mock<any>).mockResolvedValue(undefined);

      const res = await request(app)
        .put('/api/user')
        .set('Cookie', 'sessionToken=valid-token')
        .send(mockUpdateUser)
        .expect(403);
      const body = res.body as { error: UserResponseBodyPut };
      expect(body.error).toBe('User not found');
    });
  });
});
