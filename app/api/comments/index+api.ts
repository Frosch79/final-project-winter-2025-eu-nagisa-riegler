import { createComment, getAllAlbumComments } from '@/database/comments';
import { ExpoApiResponse } from '@/ExpoApiResponse';
import {
  type Comment,
  commentSchema,
} from '@/migrations/00012-createTableComments';
import { parse } from 'cookie';

export type AlbumCommentsResponseBodyGet =
  | {
      comment: Comment[];
    }
  | {
      error: string;
      errorIssues?: { message: string }[];
    };

export async function GET(
  request: Request,
): Promise<ExpoApiResponse<AlbumCommentsResponseBodyGet>> {
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

  const allComments = await getAllAlbumComments(result.data.id);

  if (!allComments) {
    return ExpoApiResponse.json(
      {
        error: 'Album still does not created',
      },
      {
        status: 500,
      },
    );
  }
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

  const newComment = token && (await createComment(token, result.data));

  if (!newComment) {
    return ExpoApiResponse.json(
      {
        error: 'Album not created or access denied creating note',
      },
      {
        status: 500,
      },
    );
  }
  return ExpoApiResponse.json({ comment: newComment });
}
