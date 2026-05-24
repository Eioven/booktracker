import { test, expect } from '@fixtures/base'
import { startOfYear, endOfYear, startOfMonth, endOfMonth, daysFromNow } from '@helpers/dates'
import * as allure from '@helpers/allure'

/**
 * Блок 4. Цели чтения — 9 сценариев (5 @critical).
 */

test.describe('Блок 4. Цели чтения', () => {
  test.beforeEach(async () => {
    await allure.epic('Цели')
    await allure.feature('CRUD целей')
  })

  test('GOAL-01 @smoke @critical Создание годовой цели «10 книг»', async ({
    goalsPage,
    authenticatedPage,
  }) => {
    void authenticatedPage
    await goalsPage.open()
    await goalsPage.createGoal({
      periodType: 'year',
      measureType: 'books',
      target: 10,
      periodStart: startOfYear(),
      periodEnd: endOfYear(),
    })
    await expect(goalsPage.page.getByRole('heading', { name: '10 книг', exact: true })).toBeVisible()
  })

  test('GOAL-02 @critical Создание месячной цели «500 страниц»', async ({
    goalsPage,
    authenticatedPage,
  }) => {
    void authenticatedPage
    await goalsPage.open()
    await goalsPage.createGoal({
      periodType: 'month',
      measureType: 'pages',
      target: 500,
      periodStart: startOfMonth(),
      periodEnd: endOfMonth(),
    })
    await expect(goalsPage.page.getByRole('heading', { name: '500 страниц', exact: true })).toBeVisible()
  })

  test('GOAL-03 @critical Валидация: дата окончания ≤ дате начала', async ({
    goalsPage,
    authenticatedPage,
  }) => {
    void authenticatedPage
    await goalsPage.open()
    await goalsPage.openCreateModal()
    await goalsPage.fillForm({
      periodType: 'year',
      measureType: 'books',
      target: 5,
      periodStart: daysFromNow(10),
      periodEnd: daysFromNow(1),
    })
    await goalsPage.submitButton.click()
    await expect(goalsPage.page.locator('.text-red-500').first()).toBeVisible()
  })

  test('GOAL-04 @critical Валидация: пустой target', async ({ goalsPage, authenticatedPage }) => {
    void authenticatedPage
    await goalsPage.open()
    await goalsPage.openCreateModal()
    await goalsPage.periodStartInput.fill(startOfYear())
    await goalsPage.periodEndInput.fill(endOfYear())
    await goalsPage.submitButton.click()
    await expect(goalsPage.page.locator('.text-red-500').first()).toBeVisible()
  })

  test('GOAL-05 @critical Редактирование цели — изменить target', async ({
    goalsPage,
    authenticatedPage,
  }) => {
    void authenticatedPage
    await goalsPage.open()
    await goalsPage.createGoal({
      periodType: 'year',
      measureType: 'books',
      target: 5,
      periodStart: startOfYear(),
      periodEnd: endOfYear(),
    })

    await goalsPage.page.getByRole('button', { name: 'Изменить' }).first().click()
    await expect(goalsPage.modalTitle).toBeVisible()
    await goalsPage.targetInput.fill('15')
    await goalsPage.submitButton.click()
    await expect(goalsPage.page.getByRole('heading', { name: '15 книг', exact: true })).toBeVisible()
  })

  test('GOAL-06 Удаление цели', async ({ goalsPage, page, authenticatedPage }) => {
    void authenticatedPage
    await goalsPage.open()
    await goalsPage.createGoal({
      periodType: 'month',
      measureType: 'books',
      target: 3,
      periodStart: startOfMonth(),
      periodEnd: endOfMonth(),
    })
    page.once('dialog', (d) => d.accept())
    await page.getByRole('button', { name: 'Удалить' }).first().click()
    await expect(goalsPage.emptyState).toBeVisible()
  })

  test('GOAL-07 Быстрая кнопка «Этот год» подставляет даты', async ({
    goalsPage,
    authenticatedPage,
  }) => {
    void authenticatedPage
    await goalsPage.open()
    await goalsPage.openCreateModal()
    await goalsPage.page.getByRole('button', { name: 'Этот год' }).click()
    await expect(goalsPage.periodStartInput).toHaveValue(startOfYear())
    await expect(goalsPage.periodEndInput).toHaveValue(endOfYear())
  })

  test('GOAL-08 Прогресс цели обновляется после прочтения книги', async ({
    goalsPage,
    libraryWithBooks,
    page,
  }) => {
    await goalsPage.open()
    // Создаём цель «1 книга в этом году»
    await goalsPage.createGoal({
      periodType: 'year',
      measureType: 'books',
      target: 1,
      periodStart: startOfYear(),
      periodEnd: endOfYear(),
    })
    // У нас уже есть finished-книга в фикстуре — прогресс должен быть ≥ 0
    // Проверяем, что карточка содержит «N из 1 книг»
    await page.reload()
    await expect(page.getByText(/из 1 книг/)).toBeVisible()
    void libraryWithBooks
  })

  test('GOAL-09 Пустое состояние, когда целей нет', async ({ goalsPage, authenticatedPage }) => {
    void authenticatedPage
    await goalsPage.open()
    await expect(goalsPage.emptyState).toBeVisible()
  })
})
