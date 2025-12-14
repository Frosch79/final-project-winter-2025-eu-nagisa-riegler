import { parse } from 'cookie';
import { createAlbum } from '../../../database/albums';
import { ExpoApiResponse } from '../../../ExpoApiResponse';
import {
  type Album,
  albumSchema,
} from '../../../migrations/00006-createTableAlbums';

export type CreateAlbumResponseBodyPost =
  | {
      album: Album;
    }
  | {
      error: string;
      errorIssues?: { message: string }[];
    };

export async function POST(
  request: Request,
): Promise<ExpoApiResponse<CreateAlbumResponseBodyPost>> {
  const requestBody = await request.json();
  const result = albumSchema.safeParse(requestBody);

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

  const albumData = result.data;
  const newAlbum = token && (await createAlbum(token, albumData));

  if (!newAlbum) {
    return ExpoApiResponse.json(
      {
        error: 'Album not created or access denied creating note',
      },
      {
        status: 500,
      },
    );
  }
  return ExpoApiResponse.json({ album: newAlbum });
}
