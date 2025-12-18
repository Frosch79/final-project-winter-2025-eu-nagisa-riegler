import { parse } from 'cookie';
import { getAlbumsSwitchWithVisibility } from '../../../database/albums';
import { ExpoApiResponse } from '../../../ExpoApiResponse';
import type { FeedAlbum } from '../../../migrations/00006-createTableAlbums';

export type FeedResponseBodyGet =
  | {
      feedAlbum: FeedAlbum[];
    }
  | {
      error: string;
      errorIssues?: { message: string }[];
    };

export async function GET(
  request: Request,
): Promise<ExpoApiResponse<FeedResponseBodyGet>> {
  const { searchParams } = new URL(request.url);
  const visibility = searchParams.get('visibility') ?? 'public';
  const cookies = parse(request.headers.get('cookie') || '');
  const token = cookies.sessionToken;

  if (!token) {
    return ExpoApiResponse.json({
      error: 'No session token found',
    });
  }

  const feed =
    token && (await getAlbumsSwitchWithVisibility(token, visibility));

  if (!feed) {
    return ExpoApiResponse.json(
      {
        error: 'Album still does not created',
      },
      {
        status: 500,
      },
    );
  }
  return ExpoApiResponse.json({ feedAlbum: feed });
}
