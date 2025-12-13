import { Album } from '@/migrations/00006-createTableAlbums';
import { Photo } from '@/migrations/00008-createTablePhotos';
import { Session } from '@/migrations/00014-createTableSessions';
import { sql } from './connect';

export async function createPhotoInAlbum(
  sessionToken: Session['token'],
  photoData: Omit<Photo, 'id' | 'createdDate'>,
) {
  const [createdPhoto] = await sql<Photo[]>`

      INSERT INTO
        photos(
        album_id,
        title,
        cloudinary_data_path,
        description,
        location
    )

        (
          SELECT
            albums.id,
            ${photoData.title},
            ${photoData.cloudinaryDataPath},
            ${photoData.description},
            ${photoData.location}

            FROM
             albums
             INNER JOIN sessions ON (
              sessions.token = ${sessionToken}
              AND sessions.expiry_timestamp > now()
             )
            WHERE
              albums.id = ${photoData.albumId}
        )
        RETURNING
        photos.*
    `;
  return createdPhoto;
}

export async function getAlbumPhotos(
  sessionToken: Session['token'],
  albumId: Album['id'],
) {
  const albumPhotos = await sql<Photo[]>`
  SELECT photos.*
  FROM photos
  INNER JOIN albums ON albums.id = photos.album_id
  INNER JOIN sessions ON  (sessions.token = ${sessionToken}
              AND sessions.expiry_timestamp > now()
             )

    WHERE photos.album_id =${albumId}
             `;
  return albumPhotos;
}

export async function getPhoto(photoId: Photo['id']) {
  const [photo] = await sql<Photo[]>`
  SELECT photos.* FROM photos
  INNER JOIN albums ON albums.id =photos.album_id
  WHERE photos.id = ${photoId}
  `;

  return photo;
}
export async function updatePhoto(
  sessionToken: Session['token'],
  photoData: Omit<Photo, 'id' | 'createdDate'>,
  photoId: Photo['id'],
) {
  const updatedPhoto = await sql<Photo[]>`
    UPDATE photos
    SET
      title = ${photoData.title},
      cloudinary_data_path = ${photoData.cloudinaryDataPath},
      description = ${photoData.description},
      location = ${photoData.location}
    WHERE
      photos.id=${photoId} AND photos.album_id IN (
        SELECT albums.id
        FROM albums
        INNER JOIN sessions ON (
          sessions.user_id= albums.user_id
          AND sessions.token = ${sessionToken}
          AND sessions.expiry_timestamp > now()
        )
        WHERE albums.id =${photoData.albumId}
      )
      RETURNING
      photos.* `;

  return updatedPhoto;
}

export async function deletePhoto(
  sessionToken: Session['token'],
  photoId: Photo['id'],
  albumId: Album['id'],
) {
  const deletedPhoto = await sql<Photo[]>`
    DELETE FROM photos WHERE id = ${photoId} AND album_id IN (
      SELECT albums.id
        FROM albums
        INNER JOIN sessions ON (
          sessions.user_id= albums.user_id
          AND sessions.token = ${sessionToken}
          AND sessions.expiry_timestamp > now()
        )
        WHERE albums.id = ${albumId}
      )
      RETURNING
      photos.*
    `;
  return deletedPhoto;
}

export async function selectPhotoExists(photoId: Photo['id']) {
  const [record] = await sql<{ exists: boolean }[]>`
    SELECT
      EXISTS (
        SELECT
          TRUE
        FROM
          photos
        WHERE
          id = ${photoId}
      )
  `;

  return Boolean(record?.exists);
}
