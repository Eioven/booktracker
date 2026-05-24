import { Locator, Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export interface GoalFormData {
  periodType: 'year' | 'month'
  measureType: 'books' | 'pages'
  target: number
  periodStart: string
  periodEnd: string
}

export class GoalsPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  // ===== Локаторы =====
  get header(): Locator {
    return this.page.getByRole('heading', { name: 'Цели чтения', exact: true })
  }

  get newGoalButton(): Locator {
    return this.page.getByRole('button', { name: '+ Новая цель' })
  }

  get emptyState(): Locator {
    return this.page.getByText('У вас пока нет целей')
  }

  goalCard(target: number, measureLabel: string): Locator {
    return this.page
      .locator('div')
      .filter({ has: this.page.locator('h3', { hasText: `${target} ${measureLabel}` }) })
      .first()
  }

  // ===== Модалка =====
  get modalTitle(): Locator {
    return this.page.getByRole('heading', { name: /Новая цель|Редактировать цель/ })
  }

  periodTabInModal(label: 'Год' | 'Месяц'): Locator {
    return this.page.locator('button[type="button"]', { hasText: label }).first()
  }

  measureTabInModal(label: 'Книги' | 'Страницы'): Locator {
    return this.page.locator('button[type="button"]', { hasText: label }).first()
  }

  get targetInput(): Locator {
    return this.page.locator('input[name="target"]')
  }

  get periodStartInput(): Locator {
    return this.page.locator('input[name="period_start"]')
  }

  get periodEndInput(): Locator {
    return this.page.locator('input[name="period_end"]')
  }

  get submitButton(): Locator {
    return this.page.getByRole('button', { name: /Создать цель|Сохранить/ })
  }

  // ===== Действия =====

  async open(): Promise<void> {
    await this.goto('/goals')
    await expect(this.header).toBeVisible()
  }

  async openCreateModal(): Promise<void> {
    if (await this.newGoalButton.isVisible()) {
      await this.newGoalButton.click()
    } else {
      await this.page.getByRole('button', { name: 'Поставить первую цель' }).click()
    }
    await expect(this.modalTitle).toBeVisible()
  }

  async fillForm(data: GoalFormData): Promise<void> {
    // Период
    const periodLabel = data.periodType === 'year' ? 'Год' : 'Месяц'
    await this.periodTabInModal(periodLabel).click()
    // Единица
    const measureLabel = data.measureType === 'books' ? 'Книги' : 'Страницы'
    await this.measureTabInModal(measureLabel).click()

    await this.targetInput.fill(String(data.target))
    await this.periodStartInput.fill(data.periodStart)
    await this.periodEndInput.fill(data.periodEnd)
  }

  async createGoal(data: GoalFormData): Promise<void> {
    await this.openCreateModal()
    await this.fillForm(data)
    await this.submitButton.click()
    await expect(this.modalTitle).toBeHidden({ timeout: 10_000 })
  }
}
