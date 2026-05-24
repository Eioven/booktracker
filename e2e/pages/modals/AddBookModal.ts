import { Locator, Page, expect } from '@playwright/test'
import type { ManualBook } from '@data/books'

/**
 * Модальное окно «Добавить книгу».
 * Содержит две вкладки: «Поиск» (Open Library) и «Вручную».
 */
export class AddBookModal {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  // ===== Корневой элемент модалки =====
  // Берём «окно» модалки — белый контейнер с rounded-2xl, внутри которого
  // и шапка, и контент. `.first()` отсекает повторные совпадения.
  get root(): Locator {
    return this.page
      .locator('div.bg-white.rounded-2xl')
      .filter({ has: this.page.getByRole('heading', { name: 'Добавить книгу', exact: true }) })
      .first()
  }

  get title(): Locator {
    return this.page.getByRole('heading', { name: 'Добавить книгу', exact: true })
  }

  // ===== Вкладки =====
  get searchTab(): Locator {
    return this.root.getByRole('button', { name: 'Поиск', exact: true })
  }

  get manualTab(): Locator {
    return this.root.getByRole('button', { name: 'Вручную', exact: true })
  }

  // ===== Поиск =====
  get searchInput(): Locator {
    return this.root.getByPlaceholder('Название или автор...')
  }

  get searchSubmit(): Locator {
    return this.root.getByRole('button', { name: 'Найти' })
  }

  get searchResults(): Locator {
    return this.root.locator('.flex.flex-col.gap-2 > div')
  }

  // ===== Ручное добавление =====
  get manualTitle(): Locator {
    return this.root.getByLabel('Название')
  }

  get manualAuthor(): Locator {
    return this.root.getByLabel('Автор')
  }

  get manualGenre(): Locator {
    return this.root.getByLabel('Жанр')
  }

  get manualPages(): Locator {
    return this.root.getByLabel('Страниц')
  }

  get manualYear(): Locator {
    return this.root.getByLabel('Год')
  }

  get submitManual(): Locator {
    return this.root.getByRole('button', { name: 'Добавить книгу', exact: true })
  }

  get errorBanner(): Locator {
    return this.root.locator('.bg-red-50, .text-red-500, .text-red-600').first()
  }

  // ===== Действия =====

  async expectOpen(): Promise<void> {
    await expect(this.title).toBeVisible()
  }

  async switchToManual(): Promise<void> {
    await this.manualTab.click()
    await expect(this.manualTitle).toBeVisible()
  }

  async switchToSearch(): Promise<void> {
    await this.searchTab.click()
    await expect(this.searchInput).toBeVisible()
  }

  async fillManual(book: ManualBook): Promise<void> {
    await this.manualTitle.fill(book.title)
    await this.manualAuthor.fill(book.author)
    if (book.genre) await this.manualGenre.fill(book.genre)
    if (book.totalPages !== undefined) {
      await this.manualPages.fill(String(book.totalPages))
    }
    if (book.publishedYear !== undefined) {
      await this.manualYear.fill(String(book.publishedYear))
    }
  }

  async submitManualForm(): Promise<void> {
    await this.submitManual.click()
  }

  /** Полный сценарий: открыть «Вручную», заполнить, добавить. */
  async addManualBook(book: ManualBook): Promise<void> {
    await this.switchToManual()
    await this.fillManual(book)
    await this.submitManualForm()
    await expect(this.title).toBeHidden({ timeout: 10_000 })
  }

  async expectFieldError(label: string): Promise<void> {
    const error = this.root
      .locator('label', { hasText: label })
      .locator('..')
      .locator('.text-red-500, .text-red-600')
    await expect(error).toBeVisible()
  }
}
