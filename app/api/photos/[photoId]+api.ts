import { parse } from 'cookie';
import {
  deletePhoto,
  getPhoto,
  selectPhotoExists,
  updatePhoto,
} from '../../../database/photos';
import { ExpoApiResponse } from '../../../ExpoApiResponse';
import {
  type Photo,
  photoSchema,
} from '../../../migrations/00008-createTablePhotos';

/* get my photo */
export type PhotoResponseBodyGet =
  | {
      photo: Photo;
    }
  | {
      error: string;
    };
export async function GET(
  request: Request,
  { photoId }: { photoId: string },
): Promise<ExpoApiResponse<PhotoResponseBodyGet>> {
  if (!(await selectPhotoExists(Number(photoId)))) {
    return ExpoApiResponse.json(
      {
        error: `No photo with id ${photoId} found `,
      },
      {
        status: 404,
      },
    );
  }
  const photo = await getPhoto(Number(photoId));

  if (!photo) {
    return ExpoApiResponse.json(
      {
        error: `Access denied to photo with id ${photoId}`,
      },
      {
        status: 403,
      },
    );
  }
  return ExpoApiResponse.json({ photo: photo });
}

/* Update my  photo */

export type PhotoResponseBodyPut =
  | {
      photo: Photo[];
    }
  | {
      error: string;
    };
export async function PUT(
  request: Request,
  { photoId }: { photoId: string },
  { albumId }: { albumId: string },
): Promise<ExpoApiResponse<PhotoResponseBodyPut>> {
  const requestBody = await request.json();
  const result = photoSchema.safeParse(requestBody);

  if (!result.success) {
    return ExpoApiResponse.json(
      {
        error: 'Request does not contain photo object',
        /*  errorIssues: result.error.issues, */
      },
      {
        status: 400,
      },
    );
  }

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

  if (!(await selectPhotoExists(Number(photoId)))) {
    return ExpoApiResponse.json(
      {
        error: `No photo with id ${photoId} found `,
      },
      {
        status: 404,
      },
    );
  }
  const photoData = { ...result.data, albumId: Number(albumId) };
  const photo = await updatePhoto(token, photoData, Number(photoId));

  return ExpoApiResponse.json({ photo: photo });
}

/* delete photo */

export type PhotoResponseBodyDelete =
  | {
      photo: Photo[];
    }
  | {
      error: string;
    };
export async function DELETE(
  request: Request,
  { photoId }: { photoId: string },
  { albumId }: { albumId: string },
): Promise<ExpoApiResponse<PhotoResponseBodyDelete>> {
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

  if (!(await selectPhotoExists(Number(photoId)))) {
    return ExpoApiResponse.json(
      {
        error: `No photo with id ${photoId} found `,
      },
      {
        status: 404,
      },
    );
  }
  const photo = await deletePhoto(token, Number(photoId), Number(albumId));

  return ExpoApiResponse.json({ photo: photo });
}
