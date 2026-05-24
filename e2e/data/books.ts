import { randomString } from '@helpers/random'

export type BookStatus = 'want_to_read' | 'reading' | 'finished' | 'dropped'

export interface ManualBook {
  title: string
  author: string
  genre: string
  totalPages: number
  publishedYear: number
}

export function buildManualBook(overrides: Partial<ManualBook> = {}): ManualBook {
  return {
    title: overrides.title ?? `Тестовая книга ${randomString(6)}`,
    author: overrides.author ?? `Автор Тестов ${randomString(4)}`,
    genre: overrides.genre ?? 'Тестовая фантастика',
    totalPages: overrides.totalPages ?? 320,
    publishedYear: overrides.publishedYear ?? 2024,
  }
}

/** Полезный набор фикстурных книг для тестов фильтров и статистики. */
export function buildBookBatch(): ManualBook[] {
  return [
    buildManualBook({ title: `Книга-1 ${randomString(4)}`, totalPages: 200 }),
    buildManualBook({ title: `Книга-2 ${randomString(4)}`, totalPages: 350 }),
    buildManualBook({ title: `Книга-3 ${randomString(4)}`, totalPages: 500 }),
  ]
}

export const STATUS_LABELS: Record<BookStatus, string> = {
  want_to_read: 'Хочу прочитать',
  reading: 'Читаю',
  finished: 'Прочитал',
  dropped: 'Не буду дочитывать',
}

export const STATUS_FILTER_LABELS = {
  all: 'Все книги',
  want_to_read: 'Хочу прочитать',
  reading: 'Читаю',
  finished: 'Прочитал',
  dropped: 'Не буду дочитывать',
} as const
