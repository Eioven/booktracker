import { Locator, Page, expect } from '@playwright/test'

export class CoverEditModal {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  get title(): Locator {
    return this.page.getByRole('heading', { name: 'Изменить обложку' })
  }

  get root(): Locator {
    return this.page
      .locator('div.bg-white.rounded-2xl')
      .filter({ has: this.title })
      .first()
  }

  get urlTab(): Locator {
    return this.root.getByRole('button', { name: 'По ссылке' })
  }

  get fileTab(): Locator {
    return this.root.getByRole('button', { name: 'С компьютера' })
  }

  get urlInput(): Locator {
    return this.root.getByLabel('Ссылка на изображение')
  }

  get saveUrlButton(): Locator {
    return this.root.getByRole('button', { name: /Сохранить/ })
  }

  get fileInput(): Locator {
    return this.root.locator('input[type="file"]')
  }

  get uploadButton(): Locator {
    return this.root.getByRole('button', { name: /Загрузить обложку/ })
  }

  get errorMessage(): Locator {
    return this.root.locator('.text-red-500').first()
  }

  async expectOpen(): Promise<void> {
    await expect(this.title).toBeVisible()
  }

  async saveByUrl(url: string): Promise<void> {
    await this.urlTab.click()
    await this.urlInput.fill(url)
    await this.saveUrlButton.click()
  }

  async uploadFile(filePath: string): Promise<void> {
    await this.fileTab.click()
    await this.fileInput.setInputFiles(filePath)
    await this.uploadButton.click()
  }

  async tryUploadFile(filePath: string): Promise<void> {
    await this.fileTab.click()
    await this.fileInput.setInputFiles(filePath)
  }
}
