import { Like, LikeUsers } from '@/migrations/00010-createTableLikes';
import { Session } from '@/migrations/00014-createTableSessions';
import { sql } from './connect';

export async function createLike(
  sessionToken: Session['token'],
  albumId: Like['albumId'],
) {
  const newLike = await sql<Like[]>`
  INSERT INTO
        likes(
        album_id,
        user_id
    )(
      SELECT
      ${albumId},
      users.id
      FROM
      users
      INNER JOIN sessions ON (
          sessions.token = ${sessionToken}
          AND users.id= sessions.user_id
          AND sessions.expiry_timestamp > now()
        )
    )
    RETURNING
    likes.*
  `;
  return newLike;
}

export async function deleteLike(
  sessionToken: Session['token'],
  albumId: Like['albumId'],
) {
  const deletedLike = await sql<Like[]>`
    DELETE FROM likes WHERE album_id = ${albumId} AND user_id IN (
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
  const allLikes = await sql<LikeUsers[]>`
  SELECT likes.*,users.name
  FROM
  likes
  INNER JOIN users ON users.id = likes.user_id
  WHERE album_id =${likeAlbumId}`;

  return allLikes;
}

export async function selectLikeExists(
  sessionToken: Session['token'],
  albumId: Like['albumId'],
) {
  const [record] = await sql<{ exists: boolean }[]>`
    SELECT
      EXISTS (
        SELECT
          TRUE
        FROM
          likes
          INNER JOIN sessions ON(
             sessions.token=${sessionToken}
             AND sessions.user_id= likes.user_id
             AND sessions.expiry_timestamp > now())
        WHERE
          likes.album_id=${albumId}
      )
  `;

  return Boolean(record?.exists);
}
