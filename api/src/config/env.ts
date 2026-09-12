import 'dotenv/config';
import type { StringValue } from 'ms';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Переменная окружения ${name} не задана`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as StringValue,
  uploadDir: process.env.UPLOAD_DIR ?? 'uploads',
  uploadMaxSizeBytes: Number(
    process.env.UPLOAD_MAX_SIZE_BYTES ?? 5 * 1024 * 1024,
  ),
} as const;
