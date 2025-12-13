import { User } from '@/migrations/00000-createTableUsers';
import { Comment } from '@/migrations/00012-createTableComments';
import { Session } from '@/migrations/00014-createTableSessions';
import { sql } from './connect';

export async function createComment(
  sessionToken: Session['token'],
  userComment: Pick<Comment, 'albumId' | 'content'>,
) {
  const newComment = await sql<Comment[]>`
  INSERT INTO
        comments(
        album_id,
        user_id,
        content
    )(
      SELECT
      ${userComment.albumId},
      users.id,
      ${userComment.content}
      FROM
      users
      INNER JOIN sessions ON (
        sessions.token = ${sessionToken}
          AND users.id= sessions.user_id
          AND sessions.expiry_timestamp > now()
        )


    )
    RETURNING
    comments.*
  `;
  return newComment;
}

export async function deleteComment(
  sessionToken: Session['token'],
  userCommentId: Comment['id'],
) {
  const deletedComment = await sql<Comment[]>`
    DELETE FROM comments WHERE id = ${userCommentId} AND user_id IN (
      SELECT user_id
        FROM sessions
         WHERE
         sessions.token = ${sessionToken}
          AND sessions.expiry_timestamp > now()
      )
      RETURNING
      comments.*
    `;
  return deletedComment;
}

export type CommentWithUserName = Comment & { name: User['name'] };
export async function getAllAlbumComments(commentAlbumId: Comment['albumId']) {
  const allComments = await sql<CommentWithUserName[]>`
  SELECT comments.*,users.name
  FROM
  comments
  INNER JOIN users ON users.id = comments.user_id
  WHERE album_id =${commentAlbumId}
 `;

  return allComments;
}

export async function selectCommentExists(commentId: Comment['id']) {
  const [record] = await sql<{ exists: boolean }[]>`
    SELECT
      EXISTS (
        SELECT
          TRUE
        FROM
          comments
        WHERE
          id = ${commentId}
      )
  `;

  return Boolean(record?.exists);
}
