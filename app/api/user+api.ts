import { parse } from 'cookie';
import {
  type FullUser,
  getUser,
  updateUser,
  UpdateUser,
} from '../../database/users';
import { ExpoApiResponse } from '../../ExpoApiResponse';
import { updateUserSchema } from '../../migrations/00000-createTableUsers';

export type UserResponseBodyGet =
  | {
      user: FullUser;
    }
  | {
      error: string;
      errorIssues?: { message: string }[];
    };

export async function GET(
  request: Request,
): Promise<ExpoApiResponse<UserResponseBodyGet>> {
  const cookies = parse(request.headers.get('cookie') || '');
  const token = cookies.sessionToken;

  if (!token) {
    return ExpoApiResponse.json({
      error: 'No session token found',
    });
  }

  const user = token && (await getUser(token));

  if (!user) {
    return ExpoApiResponse.json({ error: 'User not found' });
  }

  return ExpoApiResponse.json({ user: user });
}

export type UserResponseBodyPut =
  | {
      user: UpdateUser;
    }
  | {
      error: string;
      errorIssues?: { message: string }[];
    };
export async function PUT(
  request: Request,
): Promise<ExpoApiResponse<UserResponseBodyPut>> {
  const requestBody = await request.json();
  const result = updateUserSchema.safeParse(requestBody);

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

  const cookies = parse(request.headers.get('cookie') || '');
  const token = cookies.sessionToken;

  if (!token) {
    return ExpoApiResponse.json({
      error: 'No session token found',
    });
  }

  const user = token && (await updateUser(token, result.data));

  if (!user) {
    return ExpoApiResponse.json({ error: 'User not found' });
  }

  return ExpoApiResponse.json({ user: user });
}
