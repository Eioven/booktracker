import { Locator, Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'
import { AddBookModal } from './modals/AddBookModal'
import { STATUS_FILTER_LABELS } from '@data/books'

export type LibraryFilter = keyof typeof STATUS_FILTER_LABELS

export class LibraryPage extends BasePage {
  readonly addBookModal: AddBookModal

  constructor(page: Page) {
    super(page)
    this.addBookModal = new AddBookModal(page)
  }

  get header(): Locator {
    return this.page.getByRole('heading', { name: 'Библиотека' })
  }

  get addBookButton(): Locator {
    return this.page.getByRole('button', { name: '+ Добавить книгу' })
  }

  get searchInput(): Locator {
    return this.page.getByPlaceholder('Поиск по названию...')
  }

  get searchSubmit(): Locator {
    return this.page.getByRole('button', { name: 'Найти' })
  }

  get searchReset(): Locator {
    return this.page.getByRole('button', { name: 'Сбросить', exact: true })
  }

  statusFilter(filter: LibraryFilter): Locator {
    return this.page.getByRole('button', { name: STATUS_FILTER_LABELS[filter], exact: true })
  }

  get bookCards(): Locator {
    return this.page.locator('.book-card')
  }

  bookCardByTitle(title: string): Locator {
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return this.bookCards
      .filter({ has: this.page.locator('h3', { hasText: new RegExp(`^${escapedTitle}$`) }) })
      .first()
  }

  get bookCountText(): Locator {
    return this.page.locator('p', { hasText: /книг/ }).first()
  }

  get emptyState(): Locator {
    return this.page.getByText(/В вашей библиотеке пока ничего нет|Ничего не найдено|У вас пока нет|нет/i)
  }

  async open(): Promise<void> {
    await this.goto('/library')
    await expect(this.header).toBeVisible()
  }

  async filterByStatus(filter: LibraryFilter): Promise<void> {
    const statusValue = filter === 'all' ? '' : filter
    const responsePromise = this.page.waitForResponse((response) => {
      const url = response.url()
      if (!url.includes('/api/books/')) return false
      if (statusValue) return url.includes(`status=${statusValue}`)
      return !url.includes('status=')
    }, { timeout: 3_000 }).catch(() => undefined)
    await this.statusFilter(filter).click()
    await responsePromise
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query)
    await this.searchSubmit.click()
  }

  async resetSearch(): Promise<void> {
    if (await this.searchReset.isVisible()) {
      await this.searchReset.click()
    }
  }

  async openAddBookModal(): Promise<void> {
    await this.addBookButton.click()
    await this.addBookModal.expectOpen()
  }

  async openBookByTitle(title: string): Promise<void> {
    await this.bookCardByTitle(title).click()
    await this.page.waitForURL(/\/library\/\d+/)
  }

  async expectBookVisible(title: string): Promise<void> {
    await expect(this.bookCardByTitle(title)).toBeVisible()
  }

  async expectBookNotVisible(title: string): Promise<void> {
    await expect(this.bookCardByTitle(title)).toHaveCount(0)
  }

  async expectBookCount(expected: number): Promise<void> {
    await expect(this.bookCards).toHaveCount(expected)
  }
}
