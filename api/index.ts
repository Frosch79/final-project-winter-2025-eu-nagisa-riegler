import path from 'node:path';
import { createRequestHandler } from '@expo/server/adapter/vercel';

if (process.env.CI) {
  process.env.EXPO_PUBLIC_API_URL = 'http://localhost:8081';
}
export default createRequestHandler({
  build: path.join(__dirname, '../dist/server'),
});
