import { unlink } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { env } from '../../config/env';

const UPLOADS_URL_PREFIX = '/uploads/';

// Удаляет файл с диска, если ссылка указывает на локально загруженный файл
// (а не на внешний URL) — вызывается при удалении записи, которая на него ссылалась.
// Ссылка приходит из пользовательского ввода (её можно было вставить вручную, а не
// только получить от /uploads/image), поэтому путь проверяется на выход за пределы
// каталога загрузок, прежде чем что-либо удалять.
export async function deleteUploadedFileIfLocal(
  url: string | null | undefined,
): Promise<void> {
  if (!url || !url.startsWith(UPLOADS_URL_PREFIX)) return;
  const relativePath = url.slice(UPLOADS_URL_PREFIX.length);
  const uploadsRoot = resolve(process.cwd(), env.uploadDir);
  const filePath = resolve(join(uploadsRoot, relativePath));
  if (filePath !== uploadsRoot && !filePath.startsWith(uploadsRoot + sep))
    return;
  try {
    await unlink(filePath);
  } catch {
    // Файл уже отсутствует или недоступен — не мешаем удалению записи из-за этого.
  }
}
