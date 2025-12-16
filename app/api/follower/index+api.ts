import {
  type FollowUser,
  getUserAllFollowersInsecure,
} from '../../../database/followers';
import { ExpoApiResponse } from '../../../ExpoApiResponse';

export type FollowerUserResponseBodyGet =
  | {
      user: FollowUser[];
    }
  | {
      error: string;
      errorIssues?: { message: string }[];
    };

export async function GET(
  request: Request,
): Promise<ExpoApiResponse<FollowerUserResponseBodyGet>> {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  const follower = await getUserAllFollowersInsecure(Number(userId));

  if (typeof follower === 'undefined') {
    return ExpoApiResponse.json(
      {
        error: 'Follower still does not created',
      },
      {
        status: 500,
      },
    );
  }
  return ExpoApiResponse.json({ user: follower });
}
