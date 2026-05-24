import { Locator, Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'
import type { TestUser } from '@data/users'

export class RegisterPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  // ===== Локаторы =====

  get usernameInput(): Locator {
    return this.page.locator('input[name="username"]')
  }

  get emailInput(): Locator {
    return this.page.locator('input[name="email"]')
  }

  get passwordInput(): Locator {
    return this.page.locator('input[name="password"]')
  }

  get passwordConfirmInput(): Locator {
    return this.page.locator('input[name="password_confirm"]')
  }

  get submitButton(): Locator {
    return this.page.getByRole('button', { name: 'Создать аккаунт' })
  }

  get loginLink(): Locator {
    return this.page.getByRole('link', { name: /Войти|Войдите/ })
  }

  /** Сообщение валидации поля. */
  fieldError(label: string): Locator {
    return this.page
      .locator('label', { hasText: label })
      .locator('..')
      .locator('.text-red-500, .text-red-600')
  }

  get serverError(): Locator {
    return this.page.locator('.bg-red-50').first()
  }

  // ===== Действия =====

  async open(): Promise<void> {
    await this.goto('/register')
    await expect(this.submitButton).toBeVisible()
  }

  async fillForm(user: TestUser): Promise<void> {
    await this.usernameInput.fill(user.username)
    if (user.email) await this.emailInput.fill(user.email)
    await this.passwordInput.fill(user.password)
    await this.passwordConfirmInput.fill(user.passwordConfirm)
  }

  async submit(): Promise<void> {
    await this.submitButton.click()
  }

  async register(user: TestUser): Promise<void> {
    await this.fillForm(user)
    await this.submit()
  }
}
