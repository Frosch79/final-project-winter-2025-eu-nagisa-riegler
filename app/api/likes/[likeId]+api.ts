import { deleteLike } from '@/database/likes';
import { ExpoApiResponse } from '@/ExpoApiResponse';
import { type Like } from '@/migrations/00010-createTableLikes';
import { parse } from 'cookie';

/* delete like from an album */
export type AlbumLikeResponseBodyDelete =
  | {
      like: Like[];
    }
  | {
      error: string;
    };
export async function DELETE(
  request: Request,
  { likeId }: { likeId: string },
): Promise<ExpoApiResponse<AlbumLikeResponseBodyDelete>> {
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

  if (!(await deleteLike(token, Number(likeId)))) {
    return ExpoApiResponse.json(
      {
        error: `No album with id ${likeId} found `,
      },
      {
        status: 404,
      },
    );
  }
  const like = await deleteLike(token, Number(likeId));

  if (!like) {
    return ExpoApiResponse.json(
      {
        error: `Access denied to album with id ${likeId}`,
      },
      {
        status: 403,
      },
    );
  }
  return ExpoApiResponse.json({ like: like });
}
