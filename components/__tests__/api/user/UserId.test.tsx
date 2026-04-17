import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import {
  GET,
  type UserPageResponseBodyGet,
} from '../../../../app/api/users/[userId]+api';
import {
  getUserPageInsecure,
  selectUserExists,
} from '../../../../database/users';
import { mockFullUser } from '../../../../util/__tests__/__mock__/testUser';

// DB mock
jest.mock('../../../../database/users', () => ({
  getUserPageInsecure: jest.fn(),
  selectUserExists: jest.fn(),
}));

function createTestApp() {
  const app = express();

  app.get('/api/users/:userId', async (req, res) => {
    const response = await GET(
      new Request(`http://localhost/api/users/${mockFullUser.id.toString()}`),
      { userId: mockFullUser.id.toString() },
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

  test('returns user successfully', async () => {
    (selectUserExists as jest.Mock<any>).mockResolvedValue(true);
    (getUserPageInsecure as jest.Mock<any>).mockResolvedValue(mockFullUser);

    const res = await request(app)
      .get(`/api/users/${mockFullUser.id}`)
      .expect('Content-Type', /json/)
      .expect(200);

    const body = res.body as { user: UserPageResponseBodyGet };

    expect(body.user).toEqual({
      ...mockFullUser,
      createdDate: mockFullUser.createdDate.toISOString(),
      birthday: mockFullUser.birthday.toISOString(),
    });
  });

  test('returns 404 if user does not exist', async () => {
    (selectUserExists as jest.Mock<any>).mockResolvedValue(false);

    const res = await request(app).get('/api/users/999').expect(404);

    const body = res.body as { error: string };
    expect(body.error).toBe(`No user with id ${mockFullUser.id} found`);
  });

  test('returns 403 if access denied', async () => {
    (selectUserExists as jest.Mock<any>).mockResolvedValue(true);
    (getUserPageInsecure as jest.Mock<any>).mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/users/${mockFullUser.id}`)
      .expect(403);

    const body = res.body as { error: string };
    expect(body.error).toBe(`Access denied to user with id ${mockFullUser.id}`);
  });
});
