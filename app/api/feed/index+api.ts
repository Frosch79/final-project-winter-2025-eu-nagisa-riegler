import { getAlbumsInFeedWithVisibility } from '@/database/albums';
import { ExpoApiResponse } from '@/ExpoApiResponse';
import { visibilitySchema } from '@/migrations/00004-createTableVisibilities';
import { type FeedAlbum } from '@/migrations/00006-createTableAlbums';
import { parse } from 'cookie';

export type FeedResponseBodyPost =
  | {
      feedAlbum: FeedAlbum[];
    }
  | {
      error: string;
      errorIssues?: { message: string }[];
    };

export async function GET(
  request: Request,
): Promise<ExpoApiResponse<FeedResponseBodyPost>> {
  const requestBody = await request.json();
  const result = visibilitySchema.safeParse(requestBody);

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

  const feed =
    token && (await getAlbumsInFeedWithVisibility(token, result.data.name));

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
  return ExpoApiResponse.json({ feedAlbum: [feed] });
}
