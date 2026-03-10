/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import * as CloudinaryUpload from '../CloudinaryUpload';

/* eslint-disable @typescript-eslint/require-await */

jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

describe('uploadImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uploads image and returns secure_url', async () => {
    const mockUri = 'file://test.jpg';

    // fetch blob
    (global.fetch as jest.Mock)

      .mockResolvedValueOnce({
        blob: async () => new Blob(['fake'], { type: 'image/jpeg' }),
      })
      //  signature
      .mockResolvedValueOnce({
        json: async () => ({
          timestamp: '123',
          signature: 'sig',
          cloudName: 'demo',
          apiKey: 'key',
        }),
      })
      // Cloudinary upload
      .mockResolvedValueOnce({
        json: async () => ({
          secure_url: 'https://cloudinary/test.jpg',
          public_id: '123',
          width: 800,
          height: 600,
          format: 'jpg',
        }),
      }) as any;

    // uploadImage mock
    const uploadImageSpy = jest
      .spyOn(CloudinaryUpload, 'uploadImage')
      .mockImplementation(async (uri: string) => {
        const blob = await fetch(uri).then((res) => res.blob());
        const sigRes = await fetch('/api/cloudinary/sign');
        const { timestamp, signature, cloudName, apiKey } = await sigRes.json();
        const formData = new FormData();
        formData.append('file', blob, 'upload.jpg');
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        formData.append('folder', 'my_app');

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          },
        );
        const data = await uploadRes.json();
        return data.secure_url;
      });

    const url = await CloudinaryUpload.uploadImage(mockUri);
    expect(url).toBe('https://cloudinary/test.jpg');
    expect(global.fetch).toHaveBeenCalledTimes(3);

    uploadImageSpy.mockRestore();
  });
});
