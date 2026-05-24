import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

/**
 * Создаёт временный PNG-файл (1×1, прозрачный пиксель)
 * и возвращает абсолютный путь до него. Используется для тестов
 * загрузки обложки книги.
 */
export function createTempPng(name = 'cover'): string {
  // Минимальная корректная PNG-картинка 1×1, прозрачный пиксель
  const pngBytes = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    'base64',
  )
  const filePath = path.join(os.tmpdir(), `${name}_${Date.now()}.png`)
  fs.writeFileSync(filePath, pngBytes)
  return filePath
}

/** Создаёт временный «слишком большой» файл — для негативных проверок. */
export function createOversizedFile(sizeMb = 6, ext = 'png'): string {
  const filePath = path.join(os.tmpdir(), `oversized_${Date.now()}.${ext}`)
  const buf = Buffer.alloc(sizeMb * 1024 * 1024, 0)
  fs.writeFileSync(filePath, buf)
  return filePath
}

/** Создаёт временный текстовый файл с недопустимым расширением. */
export function createInvalidTypeFile(): string {
  const filePath = path.join(os.tmpdir(), `bad_${Date.now()}.txt`)
  fs.writeFileSync(filePath, 'not an image')
  return filePath
}

/** Удаляет файл, не падая, если его уже нет. */
export function safeRemove(filePath: string): void {
  try {
    fs.unlinkSync(filePath)
  } catch {
    /* ignore */
  }
}
