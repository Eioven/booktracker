import { Locator, Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export type ExportType = 'library' | 'notes'
export type ExportFormat = 'csv' | 'pdf'

export class ProfilePage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  get header(): Locator {
    return this.page.getByRole('heading', { name: 'Профиль', exact: true })
  }

  get editButton(): Locator {
    return this.page.getByRole('button', { name: 'Редактировать профиль' })
  }

  get usernameInput(): Locator {
    return this.page.getByLabel('Имя пользователя')
  }

  get emailInput(): Locator {
    return this.page.getByLabel('Email', { exact: true })
  }

  get saveButton(): Locator {
    return this.page.getByRole('button', { name: 'Сохранить', exact: true })
  }

  get cancelButton(): Locator {
    return this.page.getByRole('button', { name: 'Отмена' })
  }

  get successMessage(): Locator {
    return this.page.getByText('Профиль успешно обновлён')
  }

  exportBlock(type: ExportType): Locator {
    const label = type === 'library' ? 'Библиотека' : 'Заметки и цитаты'

    return this.page
      .locator('div.p-4.border.rounded-xl')
      .filter({ has: this.page.locator('p.text-sm.font-medium.text-gray-900', { hasText: label }) })
      .first()
  }

  formatSwitch(type: ExportType, format: ExportFormat): Locator {
    return this.exportBlock(type).getByRole('button', { name: new RegExp(`^${format}$`, 'i') })
  }

  exportButton(type: ExportType): Locator {
    return this.exportBlock(type).getByRole('button', { name: /Скачать/ })
  }

  async open(): Promise<void> {
    await this.goto('/profile')
    await expect(this.header).toBeVisible()
  }

  async setExportFormat(type: ExportType, format: ExportFormat): Promise<void> {
    await this.formatSwitch(type, format).click()
  }

  async triggerExport(type: ExportType, format: ExportFormat) {
    await this.setExportFormat(type, format)
    const downloadPromise = this.page.waitForEvent('download', { timeout: 30_000 })
    await this.exportButton(type).click()
    return downloadPromise
  }
}
