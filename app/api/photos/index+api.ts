import { parse } from 'cookie';
import { createPhotoInAlbum, getAlbumPhotos } from '../../../database/photos';
import { ExpoApiResponse } from '../../../ExpoApiResponse';
import {
  type Photo,
  photoSchema,
} from '../../../migrations/00008-createTablePhotos';

/* get my photos in album */
export type PhotoResponseBodyGet =
  | {
      photo: Photo[];
    }
  | {
      error: string;
    };
export async function GET(
  request: Request,
): Promise<ExpoApiResponse<PhotoResponseBodyGet>> {
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
  const { searchParams } = new URL(request.url);
  const albumId = searchParams.get('album');

  const photo = await getAlbumPhotos(token, Number(albumId));

  if (!photo) {
    return ExpoApiResponse.json(
      {
        error: `Access denied to photo with id ${albumId}`,
      },
      {
        status: 403,
      },
    );
  }
  return ExpoApiResponse.json({ photo: photo });
}

export type CreatePhotoResponseBodyPost =
  | {
      photo: Photo;
    }
  | {
      error: string;
      errorIssues?: { message: string }[];
    };

export async function POST(
  request: Request,
): Promise<ExpoApiResponse<CreatePhotoResponseBodyPost>> {
  const requestBody = await request.json();
  const result = photoSchema.safeParse(requestBody);

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

  const photoData = result.data;
  const newPhoto = token && (await createPhotoInAlbum(token, photoData));

  if (!newPhoto) {
    return ExpoApiResponse.json(
      {
        error: 'Album not created or access denied creating note',
      },
      {
        status: 500,
      },
    );
  }
  return ExpoApiResponse.json({ photo: newPhoto });
}
