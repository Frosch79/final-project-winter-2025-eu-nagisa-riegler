import { parse } from 'cookie';
import {
  type AlbumByUser,
  deleteAlbum,
  getVisitUserAlbum,
  selectAlbumExists,
  updateAlbum,
} from '../../../database/albums';
import { ExpoApiResponse } from '../../../ExpoApiResponse';
import {
  type Album,
  albumSchema,
} from '../../../migrations/00006-createTableAlbums';

/* get my album */
export type AlbumResponseBodyGet =
  | {
      album: AlbumByUser;
    }
  | {
      error: string;
    };
export async function GET(
  request: Request,
  { albumId }: { albumId: string },
): Promise<ExpoApiResponse<AlbumResponseBodyGet>> {
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

  if (!(await selectAlbumExists(Number(albumId)))) {
    return ExpoApiResponse.json(
      {
        error: `No album with id ${albumId} found `,
      },
      {
        status: 404,
      },
    );
  }
  const album = await getVisitUserAlbum(token, Number(albumId));

  if (!album) {
    return ExpoApiResponse.json(
      {
        error: `Access denied to album with id ${albumId}`,
      },
      {
        status: 403,
      },
    );
  }
  return ExpoApiResponse.json({ album: album });
}

/* Update my  album */

export type AlbumResponseBodyPut =
  | {
      album: Album;
    }
  | {
      error: string;
    };
export async function PUT(
  request: Request,
  { albumId }: { albumId: string },
): Promise<ExpoApiResponse<AlbumResponseBodyPut>> {
  const requestBody = await request.json();
  const result = albumSchema.safeParse(requestBody);

  if (!result.success) {
    return ExpoApiResponse.json(
      {
        error: 'Request does not contain album object',
        /*  errorIssues: result.error.issues, */
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

  if (!(await selectAlbumExists(Number(albumId)))) {
    return ExpoApiResponse.json(
      {
        error: `No album with id ${albumId} found `,
      },
      {
        status: 404,
      },
    );
  }
  const album = await updateAlbum(token, result.data, Number(albumId));

  if (!album) {
    return ExpoApiResponse.json(
      {
        error: `Access denied to album with id ${albumId}`,
      },
      {
        status: 403,
      },
    );
  }
  return ExpoApiResponse.json({ album: album });
}

/* delete album */

export type AlbumResponseBodyDelete =
  | {
      album: Album[];
    }
  | {
      error: string;
    };
export async function DELETE(
  request: Request,
  { albumId }: { albumId: string },
): Promise<ExpoApiResponse<AlbumResponseBodyDelete>> {
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

  if (!(await selectAlbumExists(Number(albumId)))) {
    return ExpoApiResponse.json(
      {
        error: `No album with id ${albumId} found `,
      },
      {
        status: 404,
      },
    );
  }
  const album = await deleteAlbum(token, Number(albumId));

  if (!album) {
    return ExpoApiResponse.json(
      {
        error: `Access denied to album with id ${albumId}`,
      },
      {
        status: 403,
      },
    );
  }
  return ExpoApiResponse.json({ album: album });
}
