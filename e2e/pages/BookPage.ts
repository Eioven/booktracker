import { Locator, Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'
import { CoverEditModal } from './modals/CoverEditModal'
import { STATUS_LABELS, type BookStatus } from '@data/books'

export class BookPage extends BasePage {
  readonly coverModal: CoverEditModal

  constructor(page: Page) {
    super(page)
    this.coverModal = new CoverEditModal(page)
  }

  async openById(userBookId: number): Promise<void> {
    await this.goto(`/library/${userBookId}`)
    await expect(this.bookTitle).toBeVisible()
  }

  get bookTitle(): Locator {
    return this.page.locator('h1.text-2xl').first()
  }

  statusOption(status: BookStatus): Locator {
    return this.page.getByRole('button', { name: STATUS_LABELS[status], exact: true })
  }

  async changeStatus(status: BookStatus): Promise<void> {
    await this.statusOption(status).click()
  }

  get changeCoverButton(): Locator {
    return this.page.getByRole('button', { name: /Изменить обложку|Добавить обложку/ })
  }

  async openCoverModal(): Promise<void> {
    await this.changeCoverButton.click()
    await this.coverModal.expectOpen()
  }

  get currentPageInput(): Locator {
    return this.page.locator('input[type="number"]').first()
  }

  get editProgressButton(): Locator {
    return this.page.getByRole('button', { name: 'Изменить', exact: true }).first()
  }

  get savePageButton(): Locator {
    return this.page.getByRole('button', { name: /Сохранить|Обновить/ }).first()
  }

  get progressPercentText(): Locator {
    return this.page.locator('text=/^\\d+\\s*%/').first()
  }

  async setCurrentPage(value: number): Promise<void> {
    await this.editProgressButton.click()
    await this.currentPageInput.fill(String(value))
    await this.savePageButton.click()
  }

  get ratingStars(): Locator {
    return this.page.locator('div').filter({ hasText: /^Оценка$/ }).locator('..').locator('button')
  }

  async setRating(value: 1 | 2 | 3 | 4 | 5): Promise<void> {
    await this.ratingStars.nth(value - 1).click()
  }

  get reviewTextarea(): Locator {
    return this.page.getByPlaceholder(/Поделитесь впечатлениями|отзыв|Напишите/i)
  }

  get reviewEditButton(): Locator {
    return this.page.getByRole('button', { name: /Написать отзыв|Редактировать отзыв/ })
  }

  get reviewSaveButton(): Locator {
    return this.page.getByRole('button', { name: 'Сохранить' }).first()
  }

  async writeReview(text: string): Promise<void> {
    if (await this.reviewEditButton.isVisible()) {
      await this.reviewEditButton.click()
    }
    await this.reviewTextarea.fill(text)
    await this.reviewSaveButton.click()
  }

  get notesTab(): Locator {
    return this.page.getByRole('button', { name: /Заметки \(\d+\)/ })
  }

  get quotesTab(): Locator {
    return this.page.getByRole('button', { name: /Цитаты \(\d+\)/ })
  }

  get noteInput(): Locator {
    return this.page.getByPlaceholder(/Добавить заметку|Напишите заметку|Новая заметка/i)
  }

  get addNoteButton(): Locator {
    return this.page.getByRole('button', { name: /Добавить заметку/ })
  }

  noteCard(content: string): Locator {
    return this.page.locator('div', { hasText: content }).first()
  }

  async addNote(content: string): Promise<void> {
    await this.notesTab.click()
    await this.noteInput.fill(content)
    await this.addNoteButton.click()
  }

  get quoteInput(): Locator {
    return this.page.getByPlaceholder(/Текст цитаты|Цитата/i)
  }

  get quotePageInput(): Locator {
    return this.page.getByPlaceholder(/Страница|Стр\./i)
  }

  get addQuoteButton(): Locator {
    return this.page.getByRole('button', { name: /Добавить цитату/ })
  }

  async addQuote(content: string, page?: number): Promise<void> {
    await this.quotesTab.click()
    await this.quoteInput.fill(content)
    if (page !== undefined && (await this.quotePageInput.isVisible())) {
      await this.quotePageInput.fill(String(page))
    }
    await this.addQuoteButton.click()
  }

  get deleteButton(): Locator {
    return this.page.getByRole('button', { name: 'Удалить из библиотеки' })
  }

  async deleteBook(): Promise<void> {
    this.page.once('dialog', (d) => d.accept())
    await this.deleteButton.click()
    await this.page.waitForURL(/\/library(\?.*)?$/)
  }

  async expectStatusSelected(status: BookStatus): Promise<void> {
    await expect(this.statusOption(status)).toHaveClass(/bg-|text-/)
  }
}
