import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

export function createTempPng(name = 'cover'): string {

  const pngBytes = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    'base64',
  )
  const filePath = path.join(os.tmpdir(), `${name}_${Date.now()}.png`)
  fs.writeFileSync(filePath, pngBytes)
  return filePath
}

export function createOversizedFile(sizeMb = 6, ext = 'png'): string {
  const filePath = path.join(os.tmpdir(), `oversized_${Date.now()}.${ext}`)
  const buf = Buffer.alloc(sizeMb * 1024 * 1024, 0)
  fs.writeFileSync(filePath, buf)
  return filePath
}

export function createInvalidTypeFile(): string {
  const filePath = path.join(os.tmpdir(), `bad_${Date.now()}.txt`)
  fs.writeFileSync(filePath, 'not an image')
  return filePath
}

export function safeRemove(filePath: string): void {
  try {
    fs.unlinkSync(filePath)
  } catch {

  }
}
