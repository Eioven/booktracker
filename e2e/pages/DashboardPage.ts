import { Locator, Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  get header(): Locator {
    return this.page.getByRole('heading', { name: /Добро пожаловать/i })
  }

  get readingSection(): Locator {
    return this.page.locator('section', { has: this.page.getByRole('heading', { name: 'Сейчас читаю' }) })
  }

  get goalsSection(): Locator {
    return this.page.locator('section', { has: this.page.getByRole('heading', { name: 'Цели чтения' }) })
  }

  get emptyReadingState(): Locator {
    return this.readingSection.getByText('Вы сейчас ничего не читаете')
  }

  get emptyGoalsState(): Locator {
    return this.goalsSection.getByText('У вас пока нет целей чтения')
  }

  async open(): Promise<void> {
    await this.goto('/')
    await expect(this.header).toBeVisible()
  }

  /** Карточка читаемой книги по её названию. */
  readingBookCard(title: string): Locator {
    return this.readingSection.locator('div', { hasText: title }).first()
  }
}
