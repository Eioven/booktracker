import { Locator, Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class StatsPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  get header(): Locator {
    return this.page.getByRole('heading', { name: 'Статистика', exact: true })
  }

  get emptyState(): Locator {
    return this.page.getByText('Статистики пока нет')
  }

  /** Карточка из сводки по подписи. */
  summaryCard(label: string): Locator {
    return this.page.locator('div').filter({ hasText: label }).filter({ has: this.page.locator('p.text-2xl') })
  }

  get monthlyChartHeader(): Locator {
    return this.page.getByRole('heading', { name: 'Страниц прочитано по месяцам' })
  }

  get weeklyChartHeader(): Locator {
    return this.page.getByRole('heading', { name: /Страниц прочитано по неделям/ })
  }

  get genresChartHeader(): Locator {
    return this.page.getByRole('heading', { name: 'Распределение по жанрам' })
  }

  get authorsTableHeader(): Locator {
    return this.page.getByRole('heading', { name: 'Топ авторов' })
  }

  get calendarHeader(): Locator {
    return this.page.getByRole('heading', { name: /Календарь чтения/ })
  }

  async open(): Promise<void> {
    await this.goto('/stats')
    await expect(this.header).toBeVisible()
  }

  async getSummaryValue(label: string): Promise<string> {
    const card = this.page
      .locator('div.border.rounded-xl.p-4')
      .filter({ has: this.page.locator('p.text-xs', { hasText: new RegExp(`^${label}$`) }) })
      .first()
    return (await card.locator('p.text-2xl').first().innerText()).trim()
  }
}
