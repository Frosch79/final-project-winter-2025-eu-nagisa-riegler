import bcrypt from 'bcryptjs';
import express from 'express';
import request from 'supertest';
import { createSessionInsecure } from '../../../database/sessions';
import { getUserWithPasswordHashInsecure } from '../../../database/users';
import {
  loginUserFail,
  loginUserSuccess,
} from '../../../util/__tests__/__mock__/testUser';
import { type LoginResponseBodyPost, POST } from '../api/login+api';

jest.mock('../../../database/sessions', () => ({
  createSessionInsecure: jest.fn(),
}));
jest.mock('../../../database/users', () => ({
  getUserWithPasswordHashInsecure: jest.fn(),
}));

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.post('/api/login', async (req, res) => {
    const response = await POST(
      new Request('http://localhost/api/login', {
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

describe('Login API', () => {
  const app = createTestApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs in successfully with valid credentials', async () => {
    (getUserWithPasswordHashInsecure as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Totoro',
      passwordHash: await bcrypt.hash(loginUserSuccess.password, 10),
    });
    (createSessionInsecure as jest.Mock).mockResolvedValue({
      token: 'session-token',
      userId: 1,
    });

    const res = await request(app)
      .post('/api/login')
      .send(loginUserSuccess)
      .expect(200);

    const body = res.body as { user: { username: LoginResponseBodyPost } };
    expect(body.user.username).toBe('Totoro');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('returns 400 if request body invalid', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ wrong: 'data' })
      .expect(400);
    const body = res.body as { error: LoginResponseBodyPost };
    expect(body.error).toBe('Request does not contain user object');
  });

  it('returns 401 if user not found', async () => {
    (getUserWithPasswordHashInsecure as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/login')
      .send(loginUserFail)
      .expect(401);
    const body = res.body as { error: LoginResponseBodyPost };
    expect(body.error).toBe('Email or password not valid');
  });

  it('returns 401 if password incorrect', async () => {
    (getUserWithPasswordHashInsecure as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Totoro',
      passwordHash: await bcrypt.hash('correct-password', 10),
    });

    const res = await request(app)
      .post('/api/login')
      .send(loginUserFail)
      .expect(401);
    const body = res.body as { error: LoginResponseBodyPost };
    expect(body.error).toBe('Email or password not valid');
  });

  it('returns 401 if session creation fails', async () => {
    (getUserWithPasswordHashInsecure as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Totoro',
      passwordHash: await bcrypt.hash(loginUserSuccess.password, 10),
    });
    (createSessionInsecure as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/login')
      .send(loginUserSuccess)
      .expect(401);
    const body = res.body as { error: LoginResponseBodyPost };
    expect(body.error).toBe('Session creation failed');
  });
});
