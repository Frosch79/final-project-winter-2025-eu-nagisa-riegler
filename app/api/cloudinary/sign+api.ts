import cloudinary from '../../../cloudinary.config';
import { ExpoApiResponse } from '../../../ExpoApiResponse';

export async function GET() {
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      folder: 'my_app',
    },
    process.env.CLOUDINARY_API_SECRET!,
  );

  return ExpoApiResponse.json({
    timestamp,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  });
}
