/**
 * Утилиты для генерации уникальных тестовых данных.
 * Каждый тест получает свои значения, чтобы тесты можно было
 * запускать параллельно без коллизий.
 */

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'

/** Случайная строка указанной длины из латинских букв. */
export function randomString(length = 8): string {
  let result = ''
  for (let i = 0; i < length; i += 1) {
    result += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return result
}

/** Уникальный username с префиксом и временной меткой. */
export function uniqueUsername(prefix = 'pw'): string {
  return `${prefix}_${Date.now()}_${randomString(5)}`
}

/** Уникальный email на тестовом домене. */
export function uniqueEmail(prefix = 'pw'): string {
  return `${prefix}_${Date.now()}_${randomString(4)}@e2e.local`
}

/** Случайный пароль длины >= 8 (соответствует валидаторам Django). */
export function strongPassword(): string {
  return `Test_${randomString(6)}_${Math.floor(Math.random() * 1000)}!`
}

/** Случайное целое в диапазоне [min, max]. */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** Случайный элемент массива. */
export function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}
