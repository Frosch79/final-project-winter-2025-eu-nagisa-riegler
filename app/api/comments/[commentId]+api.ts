import { parse } from 'cookie';
import { deleteComment } from '../../../database/comments';
import { ExpoApiResponse } from '../../../ExpoApiResponse';
import type { Comment } from '../../../migrations/00012-createTableComments';

/* delete comment from an album */
export type AlbumCommentResponseBodyDelete =
  | {
      comment: Comment[];
    }
  | {
      error: string;
    };
export async function DELETE(
  request: Request,
  { commentId }: { commentId: string },
): Promise<ExpoApiResponse<AlbumCommentResponseBodyDelete>> {
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

  if (!(await deleteComment(token, Number(commentId)))) {
    return ExpoApiResponse.json(
      {
        error: `No album with id ${commentId} found `,
      },
      {
        status: 404,
      },
    );
  }
  const comment = await deleteComment(token, Number(commentId));

  if (!comment) {
    return ExpoApiResponse.json(
      {
        error: `Access denied to album with id ${commentId}`,
      },
      {
        status: 403,
      },
    );
  }
  return ExpoApiResponse.json({ comment: comment });
}
