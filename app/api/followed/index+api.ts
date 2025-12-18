import { parse } from 'cookie';
import {
  createFollow,
  deleteFollow,
  type FollowUser,
  getIsFollowed,
  getUserAllFollowedInsecure,
} from '../../../database/followers';
import { ExpoApiResponse } from '../../../ExpoApiResponse';
import {
  type Follow,
  followSchema,
} from '../../../migrations/00002-createTableFollows';

export type FollowedUserResponseBodyGet =
  | {
      user: FollowUser[];
    }
  | {
      error: string;
      errorIssues?: { message: string }[];
    };

export async function GET(
  request: Request,
): Promise<ExpoApiResponse<FollowedUserResponseBodyGet>> {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  const followed = await getUserAllFollowedInsecure(Number(userId));

  if (typeof followed === 'undefined') {
    return ExpoApiResponse.json(
      {
        error: 'Album still does not created',
      },
      {
        status: 500,
      },
    );
  }
  return ExpoApiResponse.json({ user: followed });
}

export type CreateFollowResponseBodyPost =
  | {
      follow: Follow;
    }
  | {
      error: string;
      errorIssues?: { message: string }[];
    };
export async function POST(
  request: Request,
): Promise<ExpoApiResponse<CreateFollowResponseBodyPost>> {
  const requestBody = await request.json();
  const result = followSchema.safeParse(requestBody);

  if (!result.success) {
    return ExpoApiResponse.json(
      {
        error: 'Request does not contain album object',
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

  const followedId = result.data.followedId;
  if (await getIsFollowed(token, Number(followedId))) {
    return ExpoApiResponse.json(
      {
        error: `No user with id ${followedId} found or you already followed `,
      },
      {
        status: 404,
      },
    );
  }
  const newFollow = token && (await createFollow(token, Number(followedId)));

  if (!newFollow) {
    return ExpoApiResponse.json(
      {
        error: 'Album not created or access denied creating note',
      },
      {
        status: 500,
      },
    );
  }
  return ExpoApiResponse.json({ follow: newFollow });
}

export type FollowedUserResponseBodyDelete =
  | {
      follow: Follow;
    }
  | {
      error: string;
    };
export async function DELETE(
  request: Request,
): Promise<ExpoApiResponse<FollowedUserResponseBodyDelete>> {
  const requestBody = await request.json();
  const result = followSchema.safeParse(requestBody);
  if (!result.success) {
    return ExpoApiResponse.json(
      {
        error: 'Request does not contain album object',
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
    return ExpoApiResponse.json(
      {
        error: 'No session token found',
      },
      {
        status: 401,
      },
    );
  }
  const followedId = result.data.followedId;

  if (!(await getIsFollowed(token, Number(followedId)))) {
    return ExpoApiResponse.json(
      {
        error: `No user with id ${result.data.followedId} found or you still not followed `,
      },
      {
        status: 404,
      },
    );
  }
  const unfollow = await deleteFollow(token, Number(followedId));

  if (!unfollow) {
    return ExpoApiResponse.json(
      {
        error: `Access denied to user with id ${followedId}`,
      },
      {
        status: 403,
      },
    );
  }
  return ExpoApiResponse.json({ follow: unfollow });
}
