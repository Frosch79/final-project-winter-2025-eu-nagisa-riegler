import type { User } from '@/migrations/00000-createTableUsers';
import type { Visibility } from '@/migrations/00004-createTableVisibilities';
import type {
  Album,
  AlbumByUser,
  FeedAlbum,
} from '@/migrations/00006-createTableAlbums';
import { Session } from '@/migrations/00014-createTableSessions';
import { sql } from './connect';

export async function getAlbums(sessionToken: Session['token']) {
  const [albums] = await sql<Album[]>`
  SELECT albums.*
  from
  albums
  INNER JOIN session ON(
    session.token =${sessionToken}
    AND sessions.user_id = albums.user_id
    AND expiry_timestamp > now()
  )

  `;
  return albums;
}

export async function getAlbum(
  sessionToken: Session['token'],
  albumId: Album['id'],
) {
  const [albums] = await sql<Album[]>`
  SELECT albums.*
  from
  albums

  INNER JOIN session ON(
    session.token =${sessionToken}
    AND sessions.user_id = albums.user_id
    AND expiry_timestamp > now()

  )
  WHERE
  albums.id = ${albumId}`;
  return albums;
}

export async function getAlbumByUser(
  sessionToken: Session['token'],
  albumId: Album['id'],
) {
  const album = await sql<AlbumByUser[]>`
    SELECT DISTINCT albums.*,
    users.name ,
    SUM(likes.id) AS likes_count,
    SUM(comments.id) AS comments_count
    FROM albums
    INNER JOIN users ON users.id = albums.user_id
    INNER JOIN visibilities ON visibilities.id = albums.visibility_id
    LEFT JOIN comments ON comments.album_id = albums.id
    LEFT JOIN likes ON likes.album_id= albums.id
    LEFT JOIN follows ON follows.follower_user_id = albums.user_id
    LEFT JOIN sessions ON (
      sessions.token = ${sessionToken}
    AND sessions.user_id = follows.followed_user_id
    AND expiry_timestamp > now()
    )
    WHERE
    CASE visibilities
    WHEN  visibilities.id = 2 THEN follows.followed_user_id = sessions.user_id AND albums.id = ${albumId}
    WHEN visibilities.id = 1 THEN albums.id = ${albumId}
    ELSE FALSE
    END
    ORDER BY albums.created_date
    `;
  return album;
}

export async function createAlbum(
  sessionToken: Session['token'],
  newAlbum: Album,
) {
  const createdAlbum = await sql<Album[]>`
  INSERT INTO
        albums(
        user_id,title,description,location,created_date,visibility_id
    ) (
      SELECT
          user_id,
          ${newAlbum.title},
          ${newAlbum.description},
          ${newAlbum.location},
          ${newAlbum.createdDate},
          ${newAlbum.visibilityId}
        FROM
          sessions
        WHERE
          token =${sessionToken}
        AND sessions.expiry_timestamp > now()
        )
        RETURNING
        albums.*
    `;

  return createdAlbum;
}

export async function updateAlbum(
  sessionToken: Session['token'],
  albums: Omit<Album, 'user_id'>,
) {
  const updateAlbum = await sql<Album[]>`
  UPDATE albums
  SET
    title =${albums.title},
    description = ${albums.description},
    location=${albums.location},
    created_date=${albums.createdDate},
    visibility_id=${albums.visibilityId}
  WHERE
    id = ${albums.id} AND user_id IN (
      SELECT
      user_id
      FROM
      sessions
      WHERE
      token= ${sessionToken}
      AND sessions.expiry_timestamp > now()
    )
    RETURNING
    albums.*
  `;
  return updateAlbum;
}

export async function deleteAlbum(
  sessionToken: Session['token'],
  albumId: Album['id'],
) {
  const deletedAlbum = await sql<Album[]>`
  DELETE FROM albums WHERE id= ${albumId} AND user_id IN (
      SELECT
      user_id
      FROM
      sessions
      WHERE
      token= ${sessionToken}
      AND sessions.expiry_timestamp > now()
    )
    RETURNING
    albums.title
    `;
  return deletedAlbum;
}

export async function getAlbumsInFeedWithVisibility(
  sessionToken: Session['token'],
  visibility: Visibility['name'],
) {
  let feedAlbums;
  if (visibility === 'public') {
    [feedAlbums] = await sql<FeedAlbum[]>`
    SELECT DISTINCT albums.*, users.name FROM albums
    INNER JOIN users ON users.id = albums.user_id
    INNER JOIN visibilities ON visibilities.id = albums.visibility_id
    WHERE visibilities.name = 'public'
    ORDER BY albums.created_date
    `;
  } else if (visibility === 'followerOnly') {
    [feedAlbums] = await sql<FeedAlbum[]>`
    SELECT DISTINCT albums.*, users.name FROM albums
    INNER JOIN users ON users.id = albums.user_id
    INNER JOIN visibilities ON visibilities.id = albums.visibility_id
    LEFT JOIN follows ON follows.followed_user_id = albums.user_id
    LEFT JOIN sessions ON (
      sessions.token = ${sessionToken}
    AND sessions.user_id = follows.follower_user_id
    AND expiry_timestamp > now()
    )
    WHERE visibilities.id <= 2 AND follows.follower_user_id = sessions.user_id
    ORDER BY albums.created_date
    `;
  }
  return feedAlbums;
}

export async function getMyAlbums(
  sessionToken: Session['token'],
  visibility: Visibility['name'] | undefined,
) {
  let myAlbums;
  if (visibility) {
    [myAlbums] = await sql<Album[] & User['name'] & Visibility['name']>`
    SELECT DISTINCT albums.*, users.name,visibilities.name
    FROM albums
      INNER JOIN users ON users.id = albums.user_id
      INNER JOIN visibilities ON visibilities.id = albums.visibility_id
      INNER JOIN sessions ON (
        sessions.token = ${sessionToken}
        AND sessions.user_id = albums.user_id
        AND expiry_timestamp > now()
        )
    WHERE visibilities.name = ${visibility}
    ORDER BY albums.created_date
    `;
  } else if (!visibility) {
    [myAlbums] = await sql<Album[] & User['name'] & Visibility['name']>`
    SELECT DISTINCT albums.*, users.name,visibilities.name
    FROM albums
      INNER JOIN users ON users.id = albums.user_id
      INNER JOIN visibilities ON visibilities.id = albums.visibility_id
      INNER JOIN sessions ON (
        sessions.token = ${sessionToken}
        AND sessions.user_id = albums.user_id
        AND expiry_timestamp > now()
        )
    ORDER BY albums.created_date
    `;
  }

  return myAlbums;
}

export async function selectAlbumExists(albumId: Album['id']) {
  const [record] = await sql<{ exists: boolean }[]>`
    SELECT
      EXISTS (
        SELECT
          TRUE
        FROM
          albums
        WHERE
          id = ${albumId}
      )
  `;

  return Boolean(record?.exists);
}
