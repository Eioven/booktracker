import { test, expect } from '@fixtures/base'
import { STATUS_LABELS } from '@data/books'
import * as allure from '@helpers/allure'

test.describe('Блок 2. Библиотека — фильтрация', () => {
  test.beforeEach(async () => {
    await allure.epic('Библиотека')
    await allure.feature('Фильтры')
  })

  test('LIBF-01 @smoke @critical Фильтр «Все книги» показывает все 3 книги', async ({
    libraryPage,
    libraryWithBooks,
  }) => {
    await libraryPage.open()
    await libraryPage.filterByStatus('all')
    await libraryPage.expectBookCount(libraryWithBooks.books.length)
  })

  test('LIBF-02 @critical Фильтр «Читаю» оставляет одну книгу', async ({
    libraryPage,
    libraryWithBooks,
  }) => {
    await libraryPage.open()
    await libraryPage.filterByStatus('reading')
    const expectedBook = libraryWithBooks.books.find((b) => b.status === 'reading')!
    await libraryPage.expectBookVisible(expectedBook.book.title)
    await libraryPage.expectBookCount(1)
  })

  test('LIBF-03 @critical Фильтр «Хочу прочитать»', async ({ libraryPage, libraryWithBooks }) => {
    await libraryPage.open()
    await libraryPage.filterByStatus('want_to_read')
    const expectedBook = libraryWithBooks.books.find((b) => b.status === 'want_to_read')!
    await libraryPage.expectBookVisible(expectedBook.book.title)
    await libraryPage.expectBookCount(1)
  })

  test('LIBF-04 @critical Фильтр «Прочитал»', async ({ libraryPage, libraryWithBooks }) => {
    await libraryPage.open()
    await libraryPage.filterByStatus('finished')
    const expectedBook = libraryWithBooks.books.find((b) => b.status === 'finished')!
    await libraryPage.expectBookVisible(expectedBook.book.title)
    await libraryPage.expectBookCount(1)
  })

  test('LIBF-05 Фильтр «Не буду дочитывать» — пусто', async ({ libraryPage, libraryWithBooks }) => {
    void libraryWithBooks
    await libraryPage.open()
    await libraryPage.filterByStatus('dropped')
    await libraryPage.expectBookCount(0)
  })

  test('LIBF-06 @critical Переключение фильтров обновляет список', async ({
    libraryPage,
    libraryWithBooks,
  }) => {
    void libraryWithBooks
    await libraryPage.open()
    await libraryPage.filterByStatus('reading')
    await libraryPage.expectBookCount(1)
    await libraryPage.filterByStatus('all')
    await libraryPage.expectBookCount(3)
    await libraryPage.filterByStatus('want_to_read')
    await libraryPage.expectBookCount(1)
  })

  test('LIBF-07 @critical Бейдж статуса корректно отображается на карточке', async ({
    libraryPage,
    libraryWithBooks,
  }) => {
    await libraryPage.open()
    const finishedBook = libraryWithBooks.books.find((b) => b.status === 'finished')!
    const card = libraryPage.bookCardByTitle(finishedBook.book.title)
    await expect(card).toContainText(STATUS_LABELS.finished)
  })

  test('LIBF-08 Фильтр + поиск работают совместно', async ({ libraryPage, libraryWithBooks }) => {
    await libraryPage.open()
    await libraryPage.filterByStatus('reading')
    const target = libraryWithBooks.books.find((b) => b.status === 'reading')!
    await libraryPage.search(target.book.title.slice(0, 8))
    await libraryPage.expectBookVisible(target.book.title)
    await libraryPage.expectBookCount(1)
  })
})
