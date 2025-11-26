import { getUser } from '@/database/users';
import { ExpoApiResponse } from '@/ExpoApiResponse';
import { User } from '@/migrations/00000-createTableUsers';
import { parse } from 'cookie';

export type UserPageResponseBodyGet =
  | {
      users: User[];
    }
  | {
      error: string;
      errorIssues?: { message: string }[];
    };

export async function GET(
  request: Request,
): Promise<ExpoApiResponse<UserPageResponseBodyGet>> {
  const cookies = parse(request.headers.get('cookie') || '');

  const token = cookies.sessionToken;

  if (!token) {
    return ExpoApiResponse.json({
      error: 'No session token found',
    });
  }
  const userPage = await getUser(token);

  return ExpoApiResponse.json({
    users: [userPage],
  });
}
