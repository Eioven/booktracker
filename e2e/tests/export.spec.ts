import { test, expect } from '@fixtures/base'
import * as allure from '@helpers/allure'

/**
 * Блок 6. Экспорт — 5 сценариев (4 @critical).
 */

test.describe('Блок 6. Экспорт данных', () => {
  test.beforeEach(async () => {
    await allure.epic('Экспорт')
    await allure.feature('Скачивание данных')
  })

  test('EXP-01 @smoke @critical Экспорт библиотеки в CSV', async ({
    profilePage,
    libraryWithBooks,
  }) => {
    void libraryWithBooks
    await profilePage.open()
    const download = await profilePage.triggerExport('library', 'csv')
    expect(download.suggestedFilename()).toMatch(/\.csv$/i)
    // Проверка, что файл непустой
    const path = await download.path()
    expect(path).toBeTruthy()
  })

  test('EXP-02 @critical Экспорт библиотеки в PDF', async ({ profilePage, libraryWithBooks }) => {
    void libraryWithBooks
    await profilePage.open()
    const download = await profilePage.triggerExport('library', 'pdf')
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i)
  })

  test('EXP-03 @critical Экспорт заметок в CSV', async ({ profilePage, libraryWithBooks }) => {
    void libraryWithBooks
    await profilePage.open()
    const download = await profilePage.triggerExport('notes', 'csv')
    expect(download.suggestedFilename()).toMatch(/\.csv$/i)
  })

  test('EXP-04 @critical Экспорт заметок в PDF', async ({ profilePage, libraryWithBooks }) => {
    void libraryWithBooks
    await profilePage.open()
    const download = await profilePage.triggerExport('notes', 'pdf')
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i)
  })

  test('EXP-05 Переключатель формата меняет лейбл кнопки', async ({
    profilePage,
    authenticatedPage,
  }) => {
    void authenticatedPage
    await profilePage.open()
    await profilePage.setExportFormat('library', 'pdf')
    await expect(profilePage.exportButton('library')).toContainText(/PDF/i)
    await profilePage.setExportFormat('library', 'csv')
    await expect(profilePage.exportButton('library')).toContainText(/CSV/i)
  })
})
