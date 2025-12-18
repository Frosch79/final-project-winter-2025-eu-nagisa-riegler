import { parse } from 'cookie';
import { getIsFollowed } from '../../../database/followers';
import { ExpoApiResponse } from '../../../ExpoApiResponse';

export type IsFollowedResponseBodyGet =
  | {
      result: boolean;
    }
  | {
      error: string;
    };
export async function GET(
  request: Request,
  { userId }: { userId: string },
): Promise<ExpoApiResponse<IsFollowedResponseBodyGet>> {
  const cookies = parse(request.headers.get('cookie') || '');
  const token = cookies.sessionToken;

  if (!token) {
    return ExpoApiResponse.json(
      {
        error: 'No session token found',
      },
      {
        status: 401,
      },
    );
  }

  const result = await getIsFollowed(token, Number(userId));

  return ExpoApiResponse.json({ result: result });
}
