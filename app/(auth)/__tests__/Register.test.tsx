import express from 'express';
import request from 'supertest';
import { createSessionInsecure } from '../../../database/sessions';
import { createUserInsecure, getUserInsecure } from '../../../database/users';
import { registerUserSuccess } from '../../../util/__tests__/__mock__/testUser';
import { POST, type RegisterResponseBodyPost } from '../api/register+api';

jest.mock('../../../database/sessions', () => ({
  createSessionInsecure: jest.fn(),
}));

jest.mock('../../../database/users', () => ({
  getUserInsecure: jest.fn(),
  createUserInsecure: jest.fn(),
}));

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.post('/api/register', async (req, res) => {
    const response = await POST(
      new Request('http://localhost/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

describe('Register API', () => {
  const app = createTestApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers successfully', async () => {
    (getUserInsecure as jest.Mock).mockResolvedValue(null);

    (createUserInsecure as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Totoro',
    });

    (createSessionInsecure as jest.Mock).mockResolvedValue({
      token: 'session-token',
      userId: 1,
    });

    const res = await request(app)
      .post('/api/register')
      .send(registerUserSuccess)
      .expect(200);

    const body = res.body as { user: { username: RegisterResponseBodyPost } };

    expect(body.user.username).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('returns 400 if invalid body', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ wrong: 'data' })
      .expect(400);
    const body = res.body as { error: RegisterResponseBodyPost };
    expect(body.error).toBe('Request does not contain user object');
  });

  it('returns 401 if email already taken', async () => {
    (getUserInsecure as jest.Mock).mockResolvedValue({
      id: 1,
      email: registerUserSuccess.email,
    });

    const res = await request(app)
      .post('/api/register')
      .send(registerUserSuccess)
      .expect(401);
    const body = res.body as { error: RegisterResponseBodyPost };
    expect(body.error).toBe('Email already taken');
  });

  it('returns 500 if user creation fails', async () => {
    (getUserInsecure as jest.Mock).mockResolvedValue(null);
    (createUserInsecure as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/register')
      .send(registerUserSuccess)
      .expect(500);
    const body = res.body as { error: RegisterResponseBodyPost };
    expect(body.error).toBe('Registration failed');
  });

  it('returns 401 if session creation fails', async () => {
    (getUserInsecure as jest.Mock).mockResolvedValue(null);

    (createUserInsecure as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Totoro',
    });

    (createSessionInsecure as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/register')
      .send(registerUserSuccess)
      .expect(401);
    const body = res.body as { error: RegisterResponseBodyPost };
    expect(body.error).toBe('Sessions creation failed');
  });
});
