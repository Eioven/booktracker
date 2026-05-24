import { Locator, Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  // ===== Локаторы =====

  get usernameInput(): Locator {
    return this.page.locator('input[name="username"]')
  }

  get passwordInput(): Locator {
    return this.page.locator('input[name="password"]')
  }

  get submitButton(): Locator {
    return this.page.getByRole('button', { name: 'Войти' })
  }

  get registerLink(): Locator {
    return this.page.getByRole('link', { name: /Зарегистрироваться|Зарегистрируйтесь|Создать аккаунт/i })
  }

  /** Универсальный контейнер для серверной ошибки (любой алерт/красный блок). */
  get serverError(): Locator {
    return this.page.locator('.bg-red-50, [role="alert"]').first()
  }

  /** Сообщение валидации, привязанное к конкретному полю. */
  fieldError(field: 'Имя пользователя' | 'Пароль'): Locator {
    return this.page
      .locator('label', { hasText: field })
      .locator('..')
      .locator('.text-red-500, .text-red-600')
  }

  // ===== Действия =====

  async open(): Promise<void> {
    await this.goto('/login')
    await expect(this.submitButton).toBeVisible()
  }

  async fillForm(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username)
    await this.passwordInput.fill(password)
  }

  async submit(): Promise<void> {
    await this.submitButton.click()
  }

  async login(username: string, password: string): Promise<void> {
    await this.fillForm(username, password)
    await this.submit()
  }

  // ===== Ассерты =====

  async expectOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login/)
    await expect(this.submitButton).toBeVisible()
  }

  async expectInvalidCredentialsError(): Promise<void> {
    await expect(this.serverError).toBeVisible()
    await expect(this.serverError).toContainText(/[Нн]еверн|[Пп]роизошла ошибка|[Пп]опробуйте/i)
  }
}
