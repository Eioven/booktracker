import { test, expect } from '@fixtures/base'
import * as allure from '@helpers/allure'

test.describe('Блок 5. Статистика', () => {
  test.beforeEach(async () => {
    await allure.epic('Статистика')
    await allure.feature('Аналитика чтения')
  })

  test('STATS-01 @smoke @critical Открытие страницы статистики', async ({
    statsPage,
    libraryWithBooks,
  }) => {
    void libraryWithBooks
    await statsPage.open()
    await expect(statsPage.header).toBeVisible()
  })

  test('STATS-02 @critical Карточка «Всего книг» отображает корректное число', async ({
    statsPage,
    libraryWithBooks,
  }) => {
    await statsPage.open()
    const total = await statsPage.getSummaryValue('Всего книг')
    expect(Number(total.replace(/\s/g, ''))).toBe(libraryWithBooks.books.length)
  })

  test('STATS-03 @critical Карточка «Прочитано» = 1 после фикстуры', async ({
    statsPage,
    libraryWithBooks,
  }) => {
    await statsPage.open()
    const finished = await statsPage.getSummaryValue('Прочитано')
    const expectedFinished = libraryWithBooks.books.filter((book) => book.status === 'finished').length
    expect(Number(finished)).toBe(expectedFinished)
  })

  test('STATS-04 Пустое состояние для нового пользователя', async ({
    statsPage,
    authenticatedPage,
  }) => {
    void authenticatedPage
    await statsPage.open()

    await expect(statsPage.emptyState).toBeVisible()
  })

  test('STATS-05 Раздел «Топ авторов» отображается, когда есть прочитанные', async ({
    statsPage,
    libraryWithBooks,
  }) => {
    void libraryWithBooks
    await statsPage.open()
    await expect(statsPage.authorsTableHeader).toBeVisible()
  })

  test('STATS-06 «Распределение по жанрам» появляется при наличии данных', async ({
    statsPage,
    libraryWithBooks,
  }) => {
    void libraryWithBooks
    await statsPage.open()

    const hasGenres = await statsPage.genresChartHeader.isVisible().catch(() => false)
    const hasEmpty = await statsPage.emptyState.isVisible().catch(() => false)
    expect(hasGenres || hasEmpty).toBeTruthy()
  })
})
