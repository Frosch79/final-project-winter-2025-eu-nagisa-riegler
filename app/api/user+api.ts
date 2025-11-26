import { getUser } from '@/database/users';
import { ExpoApiResponse } from '@/ExpoApiResponse';
import { User } from '@/migrations/00000-createTableUsers';
import { parse } from 'cookie';

export type UserResponseBodyGet =
  | {
      username: User['name'];
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

  return ExpoApiResponse.json({ username: user.name });
}
