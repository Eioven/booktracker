import { Page, Locator, expect } from '@playwright/test'

export class BasePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path)
  }

  async waitForReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded')
  }

  navLink(name: 'Дашборд' | 'Библиотека' | 'Цели' | 'Статистика' | 'Профиль'): Locator {
    return this.page.getByRole('link', { name })
  }

  get logoutButton(): Locator {
    return this.page.getByRole('button', { name: 'Выйти' })
  }

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
