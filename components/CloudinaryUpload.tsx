import { Platform } from 'react-native';

type CloudinaryUploadResponse = {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
};
async function compressBlob(blob: Blob): Promise<Blob> {
  const img = new Image();
  img.src = URL.createObjectURL(blob);
  await new Promise((r) => {
    img.onload = r;
  });

  const maxWidth = 1600;
  const scale = Math.min(1, maxWidth / img.width);

  const canvas = document.createElement('canvas');
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);

  return await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.7);
  });
}

export async function uploadImage(uri: string): Promise<string> {
  // For CI test
  if (process.env.CI) {
    return `mock:///test`;
  }
  const fileToUpload = {
    uri: uri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  };

  const blob = await fetch(uri).then((res) => res.blob());

  const uploadBlob =
    Platform.OS === 'web' ? await compressBlob(blob) : fileToUpload;

  const sigRes = await fetch('/api/cloudinary/sign');
  const { timestamp, signature, cloudName, apiKey } = await sigRes.json();
  const fileName = uri.split('/').pop() || 'upload.jpg';
  const formData = new FormData();

  formData.append('file', uploadBlob as any, fileName);
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

  const data: CloudinaryUploadResponse = await uploadRes.json();

  return data.secure_url;
}
