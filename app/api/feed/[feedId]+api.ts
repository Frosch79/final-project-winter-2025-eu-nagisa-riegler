import { getVisitUserAlbums, selectAlbumExists } from '@/database/albums';
import { ExpoApiResponse } from '@/ExpoApiResponse';
import type { FeedAlbum } from '@/migrations/00006-createTableAlbums';
import { parse } from 'cookie';

/* get user albums */
export type UserFeedResponseBodyGet =
  | {
      album: FeedAlbum[];
    }
  | {
      error: string;
    };
export async function GET(
  request: Request,
  { feedId }: { feedId: string },
): Promise<ExpoApiResponse<UserFeedResponseBodyGet>> {
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

  if (!(await selectAlbumExists(Number(feedId)))) {
    return ExpoApiResponse.json(
      {
        error: `No album with id ${feedId} found `,
      },
      {
        status: 404,
      },
    );
  }
  const album = await getVisitUserAlbums(token, Number(feedId));

  if (!album) {
    return ExpoApiResponse.json(
      {
        error: `Access denied to album with id ${feedId}`,
      },
      {
        status: 403,
      },
    );
  }
  return ExpoApiResponse.json({ album: album });
}
