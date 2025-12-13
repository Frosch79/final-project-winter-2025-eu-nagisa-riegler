import * as ImagePicker from 'expo-image-picker';
import { Button } from 'react-native-paper';

export default function UploadPhoto() {
  const pickImageAsync = async () => {
    /* add photo to cloudinary  */
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (result.canceled) return;

    const image = result.assets[0];
    const file = {
      uri: image.uri,
      type: image.mimeType ?? 'image/jpeg',
      name: 'upload.jpg',
    };

    // get sign
    const sigRes = await fetch('http://192.168.0.226:8081/api/cloudinary/sign'); //note: this port is only test

    const { timestamp, signature, cloudName, apiKey } = await sigRes.json();

    // FormData sends to cloudinary
    const formData = new FormData();
    formData.append('file', file as any);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
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
    setCloudinaryPath(data.secure_url);
    setIsLoading(false);
  };

  return <Button onPress={pickImageAsync}>SELECT PHOTO</Button>;
}
