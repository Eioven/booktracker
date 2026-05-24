import { Page, Locator, expect } from '@playwright/test'

/**
 * Базовый класс для всех Page Object'ов.
 * Содержит общие действия (навигация, ожидания) и доступ к навигационным
 * элементам Layout (боковая панель).
 */
export class BasePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  /** Открыть произвольный путь относительно baseURL. */
  async goto(path = '/'): Promise<void> {
    await this.page.goto(path)
  }

  /** Дождаться, пока сетевые запросы успокоятся. */
  async waitForReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded')
  }

  // ===== Layout (боковая навигация) =====

  navLink(name: 'Дашборд' | 'Библиотека' | 'Цели' | 'Статистика' | 'Профиль'): Locator {
    return this.page.getByRole('link', { name })
  }

  get logoutButton(): Locator {
    return this.page.getByRole('button', { name: 'Выйти' })
  }

  /** Имя пользователя, выводимое в нижней части сайдбара. */
  get sidebarUsername(): Locator {
    return this.page.locator('aside').getByText(/Вы вошли как/i).locator('..').locator('p').nth(1)
  }

  async expectAuthenticated(username?: string): Promise<void> {
    await expect(this.page.getByRole('link', { name: 'Библиотека' })).toBeVisible()
    if (username) {
      await expect(this.page.locator('aside').getByText(username)).toBeVisible()
    }
  }

  async logout(): Promise<void> {
    await this.logoutButton.click()
    await this.page.waitForURL(/\/login/)
  }
}
