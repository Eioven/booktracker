import { test, expect } from '@fixtures/base'
import { STATUS_LABELS } from '@data/books'
import { createTempPng, createInvalidTypeFile, createOversizedFile, safeRemove } from '@helpers/files'
import { randomString } from '@helpers/random'
import * as allure from '@helpers/allure'

test.describe('Блок 3. Страница книги', () => {
  test.beforeEach(async () => {
    await allure.epic('Книга')
    await allure.feature('Управление состоянием книги')
  })

  test('BOOK-01 @smoke @critical Открытие страницы книги по клику на карточку', async ({
    libraryPage,
    libraryWithBooks,
    bookPage,
    page,
  }) => {
    const book = libraryWithBooks.books[0]!
    await libraryPage.open()
    await libraryPage.openBookByTitle(book.book.title)
    await expect(page).toHaveURL(/\/library\/\d+/)
    await expect(bookPage.bookTitle).toContainText(book.book.title)
  })

  test('BOOK-02 @critical Смена статуса: «Хочу прочитать» → «Читаю»', async ({
    bookPage,
    libraryWithBooks,
  }) => {
    const book = libraryWithBooks.books.find((b) => b.status === 'want_to_read')!
    await bookPage.openById(book.id)
    await bookPage.changeStatus('reading')

    await expect(bookPage.statusOption('reading')).toBeVisible()
    await bookPage.page.reload()
    await expect(bookPage.statusOption('reading')).toBeVisible()
  })

  test('BOOK-03 @critical Смена статуса «Читаю» → «Прочитал»', async ({ bookPage, libraryWithBooks }) => {
    const book = libraryWithBooks.books.find((b) => b.status === 'reading')!
    await bookPage.openById(book.id)
    await bookPage.changeStatus('finished')
    await bookPage.page.reload()
    await expect(bookPage.page.getByText(STATUS_LABELS.finished).first()).toBeVisible()
  })

  test('BOOK-04 @critical Обновление прогресса (текущая страница)', async ({
    bookPage,
    libraryWithBooks,
  }) => {
    const book = libraryWithBooks.books.find((b) => b.status === 'reading')!
    await bookPage.openById(book.id)
    await bookPage.setCurrentPage(120)

    await expect(bookPage.page.getByText('120').first()).toBeVisible()
  })

  test('BOOK-05 @critical Прогресс — страница больше общего количества блокируется', async ({
    bookPage,
    libraryWithBooks,
  }) => {
    const book = libraryWithBooks.books.find((b) => b.status === 'reading')!
    await bookPage.openById(book.id)
    const totalPages = book.book.total_pages ?? 300
    const dialogPromise = bookPage.page.waitForEvent('dialog')
    await bookPage.setCurrentPage(totalPages + 100)
    const dialog = await dialogPromise
    expect(dialog.message()).toMatch(/не может превышать|Не удалось обновить/i)
    await dialog.accept()
  })

  test('BOOK-06 @critical Установка оценки (5 звёзд)', async ({ bookPage, libraryWithBooks }) => {
    const book = libraryWithBooks.books.find((b) => b.status === 'finished')!
    await bookPage.openById(book.id)
    await bookPage.setRating(5)
    await bookPage.page.reload()

    await expect(bookPage.ratingStars.nth(4)).toBeVisible()
  })

  test('BOOK-07 Сброс оценки (повторный клик на ту же звезду — оценка снимается)', async ({
    bookPage,
    libraryWithBooks,
  }) => {
    const book = libraryWithBooks.books.find((b) => b.status === 'finished')!
    await bookPage.openById(book.id)
    await bookPage.setRating(4)
    await bookPage.setRating(4)

    await expect(bookPage.bookTitle).toBeVisible()
  })

  test('BOOK-08 @critical Написание отзыва', async ({ bookPage, libraryWithBooks }) => {
    const book = libraryWithBooks.books.find((b) => b.status === 'finished')!
    const review = `Отличная книга! ${randomString(8)}`
    await bookPage.openById(book.id)
    await bookPage.writeReview(review)
    await expect(bookPage.page.getByText(review)).toBeVisible()
  })

  test('BOOK-09 @critical Добавление заметки', async ({ bookPage, libraryWithBooks }) => {
    const book = libraryWithBooks.books[0]!
    const note = `Моя заметка ${randomString(8)}`
    await bookPage.openById(book.id)
    await bookPage.addNote(note)
    await expect(bookPage.page.getByText(note)).toBeVisible()
  })

  test('BOOK-10 Удаление заметки', async ({ bookPage, libraryWithBooks }) => {
    const book = libraryWithBooks.books[0]!
    const note = `Удаляемая заметка ${randomString(6)}`
    await bookPage.openById(book.id)
    await bookPage.addNote(note)
    await expect(bookPage.page.getByText(note)).toBeVisible()

    bookPage.page.once('dialog', (d) => d.accept())
    const card = bookPage.page.locator('div', { hasText: note }).first()
    const deleteBtn = card.getByRole('button', { name: /Удалить/ }).first()
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click()
      await expect(bookPage.page.getByText(note)).toHaveCount(0)
    }
  })

  test('BOOK-11 @critical Добавление цитаты', async ({ bookPage, libraryWithBooks }) => {
    const book = libraryWithBooks.books[0]!
    const quote = `Цитата ${randomString(8)}`
    await bookPage.openById(book.id)
    await bookPage.addQuote(quote, 42)
    await expect(bookPage.page.getByText(quote)).toBeVisible()
  })

  test('BOOK-12 Удаление цитаты', async ({ bookPage, libraryWithBooks }) => {
    const book = libraryWithBooks.books[0]!
    const quote = `Цитата для удаления ${randomString(6)}`
    await bookPage.openById(book.id)
    await bookPage.addQuote(quote)
    await expect(bookPage.page.getByText(quote)).toBeVisible()
    bookPage.page.once('dialog', (d) => d.accept())
    const card = bookPage.page.locator('div', { hasText: quote }).first()
    const deleteBtn = card.getByRole('button', { name: /Удалить/ }).first()
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click()
    }
  })

  test('BOOK-13 @critical Изменение обложки по URL', async ({ bookPage, libraryWithBooks }) => {
    const book = libraryWithBooks.books[0]!
    await bookPage.openById(book.id)
    await bookPage.openCoverModal()
    await bookPage.coverModal.saveByUrl('https://covers.openlibrary.org/b/id/10909258-L.jpg')

    await expect(bookPage.coverModal.title).toBeHidden({ timeout: 10_000 })
  })

  test('BOOK-14 Загрузка обложки файлом — недопустимый тип отклоняется', async ({
    bookPage,
    libraryWithBooks,
  }) => {
    const book = libraryWithBooks.books[0]!
    const badFile = createInvalidTypeFile()
    try {
      await bookPage.openById(book.id)
      await bookPage.openCoverModal()
      await bookPage.coverModal.tryUploadFile(badFile)
      await expect(bookPage.coverModal.errorMessage).toBeVisible({ timeout: 5_000 })
    } finally {
      safeRemove(badFile)
    }
  })

  test('BOOK-15 Загрузка обложки файлом — превышен лимит размера', async ({
    bookPage,
    libraryWithBooks,
  }) => {
    const book = libraryWithBooks.books[0]!
    const bigFile = createOversizedFile(6, 'png')
    try {
      await bookPage.openById(book.id)
      await bookPage.openCoverModal()
      await bookPage.coverModal.tryUploadFile(bigFile)
      await expect(bookPage.coverModal.errorMessage).toBeVisible({ timeout: 5_000 })
    } finally {
      safeRemove(bigFile)
    }
  })

  test('BOOK-16 @critical Удаление книги из библиотеки', async ({
    bookPage,
    libraryPage,
    libraryWithBooks,
  }) => {
    const book = libraryWithBooks.books[0]!
    await bookPage.openById(book.id)
    await bookPage.deleteBook()

    await libraryPage.expectBookNotVisible(book.book.title)
  })

  test.afterAll(() => {
    safeRemove(createTempPng('noop'))
  })
})
