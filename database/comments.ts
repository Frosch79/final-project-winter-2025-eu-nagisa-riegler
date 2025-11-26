import { Comment } from '@/migrations/00012-createTableComments';
import { Session } from '@/migrations/00014-createTableSessions';
import { sql } from './connect';

export async function createComment(
  sessionToken: Session['token'],
  userComment: Comment,
) {
  const newComment = await sql<Comment[]>`
  INSERT INTO
        comments(
        album_id,
        user_id,
        content,
        created_date
    )(
      SELECT
      ${userComment.albumId},
      users.id,
      ${userComment.content},
      ${userComment.createdDate}
      FROM
      users
      INNER JOIN sessions ON (
        sessions.token = ${sessionToken}
          AND users.id= sessions.user_id
          AND sessions.expiry_timestamp > now()
        )
        WHERE users.id = ${userComment.userId}

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
         sessions.token = ${sessionToken}
          AND sessions.expiry_timestamp > now()
      )
      RETURNING
      comments.*
    `;
  return deletedComment;
}

export async function getAllAlbumComments(commentAlbumId: Comment['albumId']) {
  const allComments = await sql<Comment[]>`
  SELECT comments.content,comments.created_date,users.name
  FROM
  comments
  INNER JOIN albums ON albums.id= comments.album_id
  INNER JOIN users ON users.id = comments.user_id
  WHERE albums.id =${commentAlbumId}`;

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
