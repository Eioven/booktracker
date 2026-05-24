import { test, expect } from '@fixtures/base'
import { buildManualBook } from '@data/books'
import { randomString } from '@helpers/random'
import * as allure from '@helpers/allure'

/**
 * Блок 2. Управление библиотекой — часть 1: добавление, удаление, поиск (10 сценариев).
 * Фильтры вынесены в library-filters.spec.ts (8 сценариев).
 */

test.describe('Блок 2. Библиотека — добавление и поиск', () => {
  test.beforeEach(async () => {
    await allure.epic('Библиотека')
    await allure.feature('CRUD книг')
  })

  test('LIB-01 @smoke @critical Добавление книги вручную', async ({ libraryPage, authenticatedPage }) => {
    void authenticatedPage
    const book = buildManualBook()
    await libraryPage.open()
    await libraryPage.openAddBookModal()
    await libraryPage.addBookModal.addManualBook(book)
    await libraryPage.expectBookVisible(book.title)
  })

  test('LIB-02 @critical Добавление — валидация: пустое название', async ({ libraryPage, authenticatedPage }) => {
    void authenticatedPage
    await libraryPage.open()
    await libraryPage.openAddBookModal()
    await libraryPage.addBookModal.switchToManual()
    await libraryPage.addBookModal.submitManualForm()
    await libraryPage.addBookModal.expectFieldError('Название')
  })

  test('LIB-03 @critical Добавление — валидация: пустой автор', async ({ libraryPage, authenticatedPage }) => {
    void authenticatedPage
    await libraryPage.open()
    await libraryPage.openAddBookModal()
    await libraryPage.addBookModal.switchToManual()
    await libraryPage.addBookModal.manualTitle.fill('Без автора')
    await libraryPage.addBookModal.submitManualForm()
    await libraryPage.addBookModal.expectFieldError('Автор')
  })

  test('LIB-04 Добавление — отрицательное число страниц', async ({ libraryPage, authenticatedPage }) => {
    void authenticatedPage
    const book = buildManualBook({ totalPages: -10 })
    await libraryPage.open()
    await libraryPage.openAddBookModal()
    await libraryPage.addBookModal.switchToManual()
    await libraryPage.addBookModal.fillManual(book)
    await libraryPage.addBookModal.submitManualForm()
    await libraryPage.addBookModal.expectFieldError('Страниц')
  })

  test('LIB-05 Добавление — некорректный год издания', async ({ libraryPage, authenticatedPage }) => {
    void authenticatedPage
    const book = buildManualBook({ publishedYear: 1300 })
    await libraryPage.open()
    await libraryPage.openAddBookModal()
    await libraryPage.addBookModal.switchToManual()
    await libraryPage.addBookModal.fillManual(book)
    await libraryPage.addBookModal.submitManualForm()
    // Либо клиентская валидация, либо серверная ошибка
    await expect(libraryPage.addBookModal.root.locator('.text-red-500, .bg-red-50').first()).toBeVisible({
      timeout: 5_000,
    })
  })

  test('LIB-06 @critical Запрет дубликата книги', async ({ libraryPage, authenticatedPage }) => {
    void authenticatedPage
    const book = buildManualBook()
    await libraryPage.open()

    // Первое добавление — успешно
    await libraryPage.openAddBookModal()
    await libraryPage.addBookModal.addManualBook(book)
    await libraryPage.expectBookVisible(book.title)

    // Второе — ожидаем ошибку
    await libraryPage.openAddBookModal()
    await libraryPage.addBookModal.switchToManual()
    await libraryPage.addBookModal.fillManual(book)
    await libraryPage.addBookModal.submitManualForm()
    await expect(libraryPage.addBookModal.errorBanner).toBeVisible()
    await expect(libraryPage.addBookModal.errorBanner).toContainText(/уже есть/i)
  })

  test('LIB-07 @smoke @critical Поиск по названию находит книгу', async ({ libraryPage, libraryWithBooks }) => {
    const target = libraryWithBooks.books[0]!
    await libraryPage.open()
    await libraryPage.search(target.book.title.slice(0, 10))
    await libraryPage.expectBookVisible(target.book.title)
  })

  test('LIB-08 @critical Поиск с пустым результатом', async ({ libraryPage, libraryWithBooks }) => {
    void libraryWithBooks
    await libraryPage.open()
    await libraryPage.search(`nomatch_${randomString(10)}`)
    // Все карточки должны исчезнуть
    await libraryPage.expectBookCount(0)
  })

  test('LIB-09 @critical Сброс поиска возвращает все книги', async ({ libraryPage, libraryWithBooks }) => {
    await libraryPage.open()
    await libraryPage.search(`nomatch_${randomString(10)}`)
    await libraryPage.expectBookCount(0)
    await libraryPage.resetSearch()
    await libraryPage.expectBookCount(libraryWithBooks.books.length)
  })

  test('LIB-10 Подсчёт «N книг» отображается корректно (склонение)', async ({
    libraryPage,
    libraryWithBooks,
  }) => {
    await libraryPage.open()
    // У нас 3 книги — должно быть «3 книги»
    await expect(libraryPage.bookCountText).toContainText(/3 книги/)
    void libraryWithBooks
  })
})
