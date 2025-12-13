import type { User } from '@/migrations/00000-createTableUsers';
import type { Visibility } from '@/migrations/00004-createTableVisibilities';
import type {
  Album,
  AlbumWithVisibilityName,
  FeedAlbum,
} from '@/migrations/00006-createTableAlbums';
import { Photo } from '@/migrations/00008-createTablePhotos';
import { Session } from '@/migrations/00014-createTableSessions';
import { sql } from './connect';

export async function getAlbum(
  sessionToken: Session['token'],
  albumId: Album['id'],
) {
  const [album] = await sql<AlbumWithVisibilityName[]>`
  SELECT
  albums.title,
  albums.description,
  albums.location,
  albums.created_date,
  visibilities.name AS visibility_name
  FROM
  albums
  INNER JOIN visibilities ON visibilities.id =albums.visibility_id
  INNER JOIN sessions ON(
    sessions.token =${sessionToken}
    AND sessions.user_id = albums.user_id
    AND expiry_timestamp > now()

  )
  WHERE
  albums.id = ${albumId}`;
  return album;
}

export async function createAlbum(
  sessionToken: Session['token'],
  newAlbum: Omit<AlbumWithVisibilityName, 'createdDate'>,
) {
  const [createdAlbum] = await sql<Album[]>`
  INSERT INTO
        albums(
        user_id,title,description,location,visibility_id
    )
     (
      SELECT
          sessions.user_id,
          ${newAlbum.title},
          ${newAlbum.description},
          ${newAlbum.location},
          visibilities.id
        FROM
          sessions
          JOIN visibilities
            ON visibilities.name = ${newAlbum.visibilityName}

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
  albums: Omit<AlbumWithVisibilityName, 'createdDate'>,
  albumId: number,
) {
  const updateAlbum = await sql<Album[]>`
  UPDATE albums
  SET
    title =${albums.title},
    description = ${albums.description},
    location=${albums.location},
    visibility_id=(SELECT visibilities.id
    FROM visibilities
    WHERE visibilities.name= ${albums.visibilityName})

   WHERE albums.id = ${albumId} AND user_id IN (
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

export async function getAlbumsSwitchWithVisibility(
  sessionToken: Session['token'],
  visibility: Visibility['name'],
) {
  /* all visibility level control */
  const feedAlbums = await sql<FeedAlbum[]>`

  WITH safe_user AS (
    SELECT user_id
    FROM sessions
    WHERE token = ${sessionToken}
      AND expiry_timestamp > now()
    LIMIT 1
)

SELECT
  albums.*,
  users.name,
  COUNT(DISTINCT comments.id)::integer AS comment_count,
  COUNT(DISTINCT likes.id)::integer AS like_count

FROM albums
INNER JOIN users ON users.id = albums.user_id
INNER JOIN visibilities ON visibilities.id = albums.visibility_id
LEFT JOIN photos ON photos.album_id =albums.id
LEFT JOIN comments ON comments.album_id = albums.id
LEFT JOIN likes ON likes.album_id = albums.id
LEFT JOIN follows ON follows.followed_user_id = albums.user_id
CROSS JOIN safe_user

WHERE
photos.id IS NOT NULL AND
 ( (
    ${visibility} = 'public'
    AND albums.visibility_id = 1
  )
  OR (
   ${visibility} = 'followersOnly'
    AND (  albums.visibility_id <= 2 AND follows.follower_user_id = safe_user.user_id
         OR albums.user_id = safe_user.user_id)
  ))
  OR (
    ${visibility}= 'private'
    AND albums.user_id = safe_user.user_id
  )

GROUP BY albums.id, users.name
ORDER BY albums.created_date DESC;

    `;
  return feedAlbums;
}

export async function getVisitUserAlbums(
  sessionToken: Session['token'],
  userId: User['id'],
) {
  /* if user visits other user albums page */
  const visitUserAlbums = await sql<FeedAlbum[]>`
      WITH safe_user AS (
    SELECT user_id
    FROM sessions
    WHERE token = ${sessionToken}
      AND expiry_timestamp > now()
    LIMIT 1
)
  SELECT DISTINCT
  albums.*,
  users.name,
  COUNT(DISTINCT comments.id)::integer AS comment_count,
  COUNT(DISTINCT likes.id)::integer AS like_count
  FROM users
  LEFT JOIN albums ON users.id = albums.user_id
  LEFT JOIN  follows ON follower_user_id = albums.user_id
  LEFT JOIN comments ON comments.album_id = albums.id
  LEFT JOIN likes ON likes.album_id = albums.id
  CROSS JOIN safe_user

 WHERE users.id =${userId}
 AND((safe_user.user_id = follows.followed_user_id AND  albums.visibility_id <=2)
 OR(safe_user.user_id = albums.user_id AND albums.visibility_id <=3)
 OR albums.visibility_id = 1 )
  GROUP BY
albums.id,users.name
ORDER BY albums.created_date DESC
  `;
  return visitUserAlbums;
}

export type AlbumByUser = Album & { userName: User['name'] } & {
  visibilityName: Visibility['name'];
} & { photos: Photo[] };
export async function getVisitUserAlbum(
  sessionToken: Session['token'],
  albumId: Album['id'],
) {
  /* if user visits other user album */
  const [visitAlbum] = await sql<AlbumByUser[]>`

    WITH safe_user AS (
    SELECT user_id
    FROM sessions
    WHERE token = ${sessionToken}
      AND expiry_timestamp > now()
    LIMIT 1
)
  SELECT DISTINCT
   albums.* ,
   users.name AS user_name,
   visibilities.name AS visibilityName,
   COALESCE(
    jsonb_agg(
      DISTINCT jsonb_build_object(
        'id', photos.id,
  'albumId', photos.album_id,
  'photoTitle', photos.title,
  'cloudinaryDataPath', photos.cloudinary_data_path,
  'Description', photos.description,
  'Location', photos.location,
  'CreatedDate',photos.created_date
      )
    ) FILTER (WHERE photos.id IS NOT NULL),
  '[]'::jsonb) AS photos
  FROM albums
  INNER JOIN visibilities ON visibilities.id = albums.visibility_id
  LEFT JOIN photos ON photos.album_id =  albums.id
  INNER JOIN users ON users.id = albums.user_id
  LEFT JOIN  follows ON followed_user_id = albums.user_id
  CROSS JOIN safe_user

 WHERE
  albums.id = ${albumId}
  AND (
      -- public
      albums.visibility_id = 1

      -- followsOnly
      OR (
        albums.visibility_id = 2 AND (
             albums.user_id = safe_user.user_id          -- my album
          OR follows.follower_user_id = safe_user.user_id -- follow album
        )
      )

      -- private
      OR (
        albums.visibility_id = 3
        AND albums.user_id = safe_user.user_id
      )
  )
  GROUP BY
albums.id,users.name,visibilities.name
  `;

  return visitAlbum;
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
