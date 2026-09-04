import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { env } from '../../config/env';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const IMAGES_DIR = join(process.cwd(), env.uploadDir, 'images');

if (!existsSync(IMAGES_DIR)) {
  mkdirSync(IMAGES_DIR, { recursive: true });
}

export const imageUploadOptions: MulterOptions = {
  storage: diskStorage({
    destination: IMAGES_DIR,
    filename: (_req, file, callback) => {
      callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
    },
  }),
  limits: { fileSize: env.uploadMaxSizeBytes },
  fileFilter: (_req, file, callback) => {
    callback(null, ALLOWED_MIME_TYPES.includes(file.mimetype));
  },
};
