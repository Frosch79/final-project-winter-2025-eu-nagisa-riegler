import { parse } from 'cookie';
import { type FullUser, getUser } from '../../database/users';
import { ExpoApiResponse } from '../../ExpoApiResponse';

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
