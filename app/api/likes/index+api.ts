import { createLike, getAllAlbumLikesInsecure } from '@/database/likes';
import { ExpoApiResponse } from '@/ExpoApiResponse';
import { type Like, likeSchema } from '@/migrations/00010-createTableLikes';
import { parse } from 'cookie';

export type AlbumLikesResponseBodyGet =
  | {
      like: Like[];
    }
  | {
      error: string;
      errorIssues?: { message: string }[];
    };

export async function GET(
  request: Request,
): Promise<ExpoApiResponse<AlbumLikesResponseBodyGet>> {
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

  const allLikes = await getAllAlbumLikesInsecure(result.data.id);

  if (!allLikes) {
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

  const newLike = token && (await createLike(token, result.data));

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
