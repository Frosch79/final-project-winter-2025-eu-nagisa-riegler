import crypto from 'node:crypto';
import bcryptJs from 'bcryptjs';
import { createSessionInsecure } from '../../../database/sessions';
import { getUserWithPasswordHashInsecure } from '../../../database/users';
import { ExpoApiResponse } from '../../../ExpoApiResponse';
import {
  type User,
  userLoginSchema,
} from '../../../migrations/00000-createTableUsers';
import { createSerializedRegisterSessionTokenCookie } from '../../../util/cookies';

export type LoginResponseBodyPost =
  | {
      user: { username: User['name'] };
    }
  | {
      error: string;
      errorIssues?: { message: string }[];
    };

export async function POST(
  request: Request,
): Promise<ExpoApiResponse<LoginResponseBodyPost>> {
  const requestBody = await request.json();

  const result = userLoginSchema.safeParse(requestBody);

  if (!result.success) {
    return ExpoApiResponse.json(
      {
        error: 'Request does not contain user object',
        errorIssues: result.error.issues,
      },
      {
        status: 400,
      },
    );
  }

  const userWithPasswordHash = await getUserWithPasswordHashInsecure(
    result.data.email,
  );

  if (!userWithPasswordHash) {
    return ExpoApiResponse.json(
      {
        error: 'Email or password not valid',
      },
      {
        status: 401,
      },
    );
  }

  const passwordHash = await bcryptJs.compare(
    result.data.password,
    userWithPasswordHash.passwordHash,
  );

  if (!passwordHash) {
    return ExpoApiResponse.json(
      {
        error: 'Email or password not valid',
      },
      {
        status: 401,
      },
    );
  }

  const token = crypto.randomBytes(100).toString('base64');

  const session = await createSessionInsecure(token, userWithPasswordHash.id);

  if (!session) {
    return ExpoApiResponse.json(
      {
        error: 'Session creation failed',
      },
      {
        status: 401,
      },
    );
  }

  const serializedCookie = createSerializedRegisterSessionTokenCookie(
    session.token,
  );

  return ExpoApiResponse.json(
    {
      user: {
        username: userWithPasswordHash.name,
      },
    },
    {
      headers: {
        'Set-cookie': serializedCookie,
      },
    },
  );
}
