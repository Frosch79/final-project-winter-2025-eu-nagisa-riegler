import { parse } from 'cookie';
import {
  type CommentWithUserName,
  createComment,
  getAllAlbumComments,
} from '../../../database/comments';
import { ExpoApiResponse } from '../../../ExpoApiResponse';
import {
  type Comment,
  commentSchema,
} from '../../../migrations/00012-createTableComments';

export type AlbumCommentsResponseBodyGet =
  | {
      comment: CommentWithUserName[];
    }
  | {
      error: string;
      errorIssues?: { message: string }[];
    };

export async function GET(
  request: Request,
): Promise<ExpoApiResponse<AlbumCommentsResponseBodyGet>> {
  const { searchParams } = new URL(request.url);
  const albumId = searchParams.get('album');

  const allComments = await getAllAlbumComments(Number(albumId));

  return ExpoApiResponse.json({ comment: allComments });
}

export type CreateAlbumCommentResponseBodyPost =
  | {
      comment: Comment[];
    }
  | {
      error: string;
      errorIssues?: { message: string }[];
    };
export async function POST(
  request: Request,
): Promise<ExpoApiResponse<CreateAlbumCommentResponseBodyPost>> {
  const requestBody = await request.json();
  const result = commentSchema.safeParse(requestBody);

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
  const content = result.data;
  const newComment = token && (await createComment(token, content));

  if (!newComment) {
    return ExpoApiResponse.json(
      {
        error: 'Comment not created or access denied creating Comment ',
      },
      {
        status: 500,
      },
    );
  }
  return ExpoApiResponse.json({ comment: newComment });
}
