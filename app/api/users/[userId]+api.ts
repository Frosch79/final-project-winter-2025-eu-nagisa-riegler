import {
  type FullUser,
  getUserPageInsecure,
  selectUserExists,
} from '../../../database/users';
import { ExpoApiResponse } from '../../../ExpoApiResponse';

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
  const numericId = Number(userId);

  if (isNaN(numericId)) {
    return ExpoApiResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  if (!(await selectUserExists(numericId))) {
    return ExpoApiResponse.json(
      { error: `No user with id ${numericId} found` },
      { status: 404 },
    );
  }

  const user = await getUserPageInsecure(numericId);

  if (!user) {
    return ExpoApiResponse.json(
      { error: `Access denied to user with id ${numericId}` },
      { status: 403 },
    );
  }

  return ExpoApiResponse.json({ user });
}
