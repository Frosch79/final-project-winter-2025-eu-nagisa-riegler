import {
  type FullUser,
  getUserPageInsecure,
  selectUserExists,
} from '@/database/users';
import { ExpoApiResponse } from '@/ExpoApiResponse';

export type UserPageResponseBodyGet =
  | {
      user: FullUser;
    }
  | {
      error: string;
    };

export async function GET(
  request: Request,
  { userId }: { userId: string },
): Promise<ExpoApiResponse<UserPageResponseBodyGet>> {
  if (!(await selectUserExists(Number(userId)))) {
    return ExpoApiResponse.json(
      {
        error: `No album with id ${userId} found `,
      },
      {
        status: 404,
      },
    );
  }
  const user = await getUserPageInsecure(Number(userId));

  if (!user) {
    return ExpoApiResponse.json(
      {
        error: `Access denied to album with id ${userId}`,
      },
      {
        status: 403,
      },
    );
  }

  return ExpoApiResponse.json({ user: user });
}
