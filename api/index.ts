import path from 'node:path';
import { createRequestHandler } from '@expo/server/adapter/vercel';

export default createRequestHandler({
  build: path.join(__dirname, '../dist/server'),
});

/* import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequestHandler } from '@expo/server/adapter/vercel';

const currentDir = dirname(fileURLToPath(import.meta.url));

export default createRequestHandler({
  build: join(currentDir, '../dist/server'),
}); */
