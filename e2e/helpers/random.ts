

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'

export function randomString(length = 8): string {
  let result = ''
  for (let i = 0; i < length; i += 1) {
    result += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return result
}

export function uniqueUsername(prefix = 'pw'): string {
  return `${prefix}_${Date.now()}_${randomString(5)}`
}

export function uniqueEmail(prefix = 'pw'): string {
  return `${prefix}_${Date.now()}_${randomString(4)}@e2e.local`
}

export function strongPassword(): string {
  return `Test_${randomString(6)}_${Math.floor(Math.random() * 1000)}!`
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}
