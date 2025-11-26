import { createAlbum, getMyAlbums } from '@/database/albums';
import { ExpoApiResponse } from '@/ExpoApiResponse';
import { visibilitySchema } from '@/migrations/00004-createTableVisibilities';
import { type Album, albumSchema } from '@/migrations/00006-createTableAlbums';
import { parse } from 'cookie';

export type MyAlbumsResponseBodyGet =
  | {
      album: Album[];
    }
  | {
      error: string;
      errorIssues?: { message: string }[];
    };

export async function GET(
  request: Request,
): Promise<ExpoApiResponse<MyAlbumsResponseBodyGet>> {
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

  const myAlbums = token && (await getMyAlbums(token, result.data.name));

  if (!myAlbums) {
    return ExpoApiResponse.json(
      {
        error: 'Album still does not created',
      },
      {
        status: 500,
      },
    );
  }
  return ExpoApiResponse.json({ album: [myAlbums] });
}

export type CreateAlbumResponseBodyPost =
  | {
      album: Album[];
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
