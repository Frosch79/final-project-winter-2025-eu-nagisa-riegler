import { ExpoApiResponse } from '@/ExpoApiResponse';
import { deleteSerializedRegisterSessionTokenCookie } from '@/util/cookies';
import { parse } from 'cookie';

export type LogoutResponseBodyGet =
  | {
      message: string;
    }
  | {
      error: string;
      errorIssues?: { message: string }[];
    };

export async function GET(
  request: Request,
): Promise<ExpoApiResponse<LogoutResponseBodyGet>> {
  const cookies = parse(request.headers.get('cookie') || '');

  const token = cookies.sessionToken;

  if (!token) {
    return ExpoApiResponse.json(
      {
        error: 'No session token found',
      },
      {
        status: 404,
      },
    );
  }

  const sessionDeleted = deleteSerializedRegisterSessionTokenCookie();

  return ExpoApiResponse.json(
    {
      message: 'Logged out',
    },
    {
      headers: {
        'Set-cookie': sessionDeleted,
      },
    },
  );
}
