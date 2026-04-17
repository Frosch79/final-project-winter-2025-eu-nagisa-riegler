import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import { deleteSession } from '../../../database/sessions';
import { GET, type LogoutResponseBodyGet } from '../api/logout+api';

jest.mock('../../../database/sessions', () => ({
  deleteSession: jest.fn(),
}));

function createTestApp() {
  const app = express();

  app.get('/api/logout', async (req, res) => {
    const response = await GET(
      new Request('http://localhost/api/logout', {
        headers: req.headers as any,
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

describe('Logout API', () => {
  const app = createTestApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('logs out successfully when session exists', async () => {
    (deleteSession as jest.Mock<any>).mockResolvedValue({
      token: 'session-token',
    });

    const res = await request(app)
      .get('/api/logout')
      .set('Cookie', 'sessionToken=valid-token')
      .expect(200);

    const body = res.body as { message: LogoutResponseBodyGet };
    expect(body.message).toBe('Logged out');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('returns 404 if no session token in cookie', async () => {
    const res = await request(app).get('/api/logout').expect(404);
    const body = res.body as { error: LogoutResponseBodyGet };
    expect(body.error).toBe('No session token found');
  });

  test('returns 404 if session not found', async () => {
    (deleteSession as jest.Mock<any>).mockResolvedValue(null);

    const res = await request(app)
      .get('/api/logout')
      .set('Cookie', 'sessionToken=invalid-token')
      .expect(404);

    const body = res.body as { error: LogoutResponseBodyGet };
    expect(body.error).toBe('Session not found');
  });
});
