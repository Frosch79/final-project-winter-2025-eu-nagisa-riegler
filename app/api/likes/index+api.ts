import { parse } from 'cookie';
import {
  createLike,
  deleteLike,
  getAllAlbumLikesInsecure,
  selectLikeExists,
} from '../../../database/likes';
import { ExpoApiResponse } from '../../../ExpoApiResponse';
import {
  type Like,
  likeSchema,
  type LikeUsers,
} from '../../../migrations/00010-createTableLikes';

export type AlbumLikesResponseBodyGet =
  | {
      like: LikeUsers[];
    }
  | {
      error: string;
      errorIssues?: { message: string }[];
    };

export async function GET(
  request: Request,
): Promise<ExpoApiResponse<AlbumLikesResponseBodyGet>> {
  const { searchParams } = new URL(request.url);
  const albumId = searchParams.get('album');

  const allLikes = await getAllAlbumLikesInsecure(Number(albumId));

  if (typeof allLikes === 'undefined') {
    return ExpoApiResponse.json(
      {
        error: 'Album still does not created',
      },
      {
        status: 500,
      },
    );
  }
  return ExpoApiResponse.json({ like: allLikes });
}

export type CreateAlbumLikeResponseBodyPost =
  | {
      like: Like[];
    }
  | {
      error: string;
      errorIssues?: { message: string }[];
    };
export async function POST(
  request: Request,
): Promise<ExpoApiResponse<CreateAlbumLikeResponseBodyPost>> {
  const requestBody = await request.json();
  const result = likeSchema.safeParse(requestBody);

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

  const albumId = result.data.albumId;

  if (await selectLikeExists(token, Number(albumId))) {
    return ExpoApiResponse.json(
      {
        error: `No album with id ${albumId} found or you already liked `,
      },
      {
        status: 404,
      },
    );
  }

  const newLike =
    token && (await createLike(token, Number(result.data.albumId)));

  if (!newLike) {
    return ExpoApiResponse.json(
      {
        error: 'Album not created or access denied creating note',
      },
      {
        status: 500,
      },
    );
  }
  return ExpoApiResponse.json({ like: newLike });
}

export type AlbumLikeResponseBodyDelete =
  | {
      like: Like[];
    }
  | {
      error: string;
    };
export async function DELETE(
  request: Request,
): Promise<ExpoApiResponse<AlbumLikeResponseBodyDelete>> {
  const requestBody = await request.json();
  const result = likeSchema.safeParse(requestBody);
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
  const albumId = result.data.albumId;

  if (!(await selectLikeExists(token, Number(albumId)))) {
    return ExpoApiResponse.json(
      {
        error: `No album with id ${albumId} found `,
      },
      {
        status: 404,
      },
    );
  }
  const like = await deleteLike(token, Number(albumId));

  if (typeof like === 'undefined') {
    return ExpoApiResponse.json(
      {
        error: `Access denied to album with id ${albumId}`,
      },
      {
        status: 403,
      },
    );
  }
  return ExpoApiResponse.json({ like: like });
}
