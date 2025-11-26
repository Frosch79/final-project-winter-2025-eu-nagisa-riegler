import { Like } from '@/migrations/00010-createTableLikes';
import { Session } from '@/migrations/00014-createTableSessions';
import { sql } from './connect';

export async function createLike(
  sessionToken: Session['token'],
  userLike: Like,
) {
  const newLike = await sql<Like[]>`
  INSERT INTO
        likes(
        album_id,
        user_id,
        created_date
    )(
      SELECT
      ${userLike.albumId},
      users.id,
      ${userLike.createdDate}
      FROM
      users
      INNER JOIN sessions ON (
          sessions.token = ${sessionToken}
          AND users.id= sessions.user_id
          AND sessions.expiry_timestamp > now()
        )
        WHERE users.id = ${userLike.userId}

    )
    RETURNING
    likes.*,users.name AS user_name
  `;
  return newLike;
}

export async function deleteLike(
  sessionToken: Session['token'],
  userLikeId: Like['id'],
) {
  const deletedLike = await sql<Like[]>`
    DELETE FROM likes WHERE id = ${userLikeId} AND user_id IN (
      SELECT user_id
        FROM sessions
        WHERE
          sessions.token = ${sessionToken}
          AND sessions.expiry_timestamp > now()
        )

      RETURNING
      likes.*
    `;
  return deletedLike;
}

export async function getAllAlbumLikesInsecure(likeAlbumId: Like['albumId']) {
  const allLikes = await sql<Like[]>`
  SELECT likes.*,users.name AS user_name
  FROM
  likes
  INNER JOIN albums ON albums.id= likes.album_id
  INNER JOIN users ON users.id = likes.user_id
  WHERE albums.id =${likeAlbumId}`;

  return allLikes;
}

export async function selectLikeExists(likeId: Like['id']) {
  const [record] = await sql<{ exists: boolean }[]>`
    SELECT
      EXISTS (
        SELECT
          TRUE
        FROM
          likes
        WHERE
          id = ${likeId}
      )
  `;

  return Boolean(record?.exists);
}
