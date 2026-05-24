import { test, expect } from '@fixtures/base'
import { buildUser, NON_EXISTENT_USER, WEAK_PASSWORDS } from '@data/users'
import { registerUser, createApiContext } from '@api/booktracker'
import { uniqueUsername } from '@helpers/random'
import * as allure from '@helpers/allure'

/**
 * Блок 1. Аутентификация — 14 сценариев (9 @critical, 2 @smoke).
 * Покрывает регистрацию, вход, выход, валидацию форм и защиту маршрутов.
 */

test.describe('Блок 1. Аутентификация', () => {
  test.beforeEach(async () => {
    await allure.epic('Аутентификация')
    await allure.feature('Регистрация и вход')
  })

  test('AUTH-01 @smoke @critical Регистрация нового пользователя — успех', async ({
    registerPage,
    page,
    freshUser,
  }) => {
    await allure.story('Регистрация')
    await registerPage.open()
    await registerPage.register(freshUser)
    await expect(page).toHaveURL(/\/(library|dashboard|$)/, { timeout: 10_000 })
    await registerPage.expectAuthenticated(freshUser.username)
  })

  test('AUTH-02 @critical Регистрация — пароли не совпадают', async ({ registerPage, freshUser }) => {
    await registerPage.open()
    await registerPage.fillForm({ ...freshUser, passwordConfirm: `${freshUser.password}_wrong` })
    await registerPage.submit()
    await expect(registerPage.page.getByText(/[Пп]ароли не совпадают/)).toBeVisible()
  })

  test('AUTH-03 @critical Регистрация — слишком короткий пароль', async ({ registerPage, freshUser }) => {
    await registerPage.open()
    await registerPage.fillForm({ ...freshUser, password: WEAK_PASSWORDS.short, passwordConfirm: WEAK_PASSWORDS.short })
    await registerPage.submit()
    // Серверная или клиентская ошибка
    await expect(registerPage.page.locator('.text-red-500, .bg-red-50').first()).toBeVisible()
  })

  test('AUTH-04 @critical Регистрация — занятый username', async ({ registerPage, freshUser }) => {
    // Регистрируем через API
    const api = await createApiContext()
    await registerUser(api, freshUser)
    await api.dispose()

    await registerPage.open()
    await registerPage.register({ ...freshUser, email: `other_${Date.now()}@e2e.local` })
    await expect(registerPage.fieldError('Имя пользователя')).toBeVisible()
  })

  test('AUTH-05 @critical Регистрация — пустые обязательные поля', async ({ registerPage }) => {
    await registerPage.open()
    await registerPage.submit()
    // На странице остался текст кнопки и URL
    await expect(registerPage.page).toHaveURL(/\/register/)
    await expect(registerPage.page.locator('.text-red-500').first()).toBeVisible()
  })

  test('AUTH-06 Регистрация — невалидный email', async ({ registerPage, freshUser }) => {
    await registerPage.open()
    await registerPage.fillForm({ ...freshUser, email: 'not-an-email' })
    await registerPage.submit()
    // Если фронт валидирует — увидим красное поле; если нет — сервер вернёт ошибку
    await expect(registerPage.page.locator('.text-red-500, .bg-red-50').first()).toBeVisible({ timeout: 5_000 })
  })

  test('AUTH-07 @smoke @critical Логин валидным пользователем — успех', async ({
    loginPage,
    page,
    freshUser,
  }) => {
    // Сначала регистрируем через API
    const api = await createApiContext()
    await registerUser(api, freshUser)
    await api.dispose()

    await loginPage.open()
    await loginPage.login(freshUser.username, freshUser.password)
    await expect(page).toHaveURL(/\/(library|$)/, { timeout: 10_000 })
    await loginPage.expectAuthenticated(freshUser.username)
  })

  test('AUTH-08 @critical Логин — неверный пароль', async ({ loginPage, freshUser }) => {
    const api = await createApiContext()
    await registerUser(api, freshUser)
    await api.dispose()

    await loginPage.open()
    await loginPage.login(freshUser.username, 'wrong_password_123!')
    await loginPage.expectInvalidCredentialsError()
  })

  test('AUTH-09 @critical Логин — несуществующий пользователь', async ({ loginPage }) => {
    await loginPage.open()
    await loginPage.login(NON_EXISTENT_USER.username, NON_EXISTENT_USER.password)
    await loginPage.expectInvalidCredentialsError()
  })

  test('AUTH-10 Логин — пустые поля', async ({ loginPage }) => {
    await loginPage.open()
    await loginPage.submit()
    await loginPage.expectOnLoginPage()
  })

  test('AUTH-11 @critical Выход из системы', async ({ authenticatedPage, loginPage, dashboardPage }) => {
    const { page } = authenticatedPage
    await dashboardPage.open()
    await dashboardPage.logout()
    await loginPage.expectOnLoginPage()
    // localStorage очищен
    const token = await page.evaluate(() => window.localStorage.getItem('access_token'))
    expect(token).toBeFalsy()
  })

  test('AUTH-12 @critical Защищённый маршрут перенаправляет на /login', async ({ page, loginPage }) => {
    await page.goto('/library')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
    await loginPage.expectOnLoginPage()
  })

  test('AUTH-13 Переключение Login → Register по ссылке', async ({ loginPage, page }) => {
    await loginPage.open()
    await loginPage.registerLink.click()
    await expect(page).toHaveURL(/\/register/)
  })

  test('AUTH-14 Регистрация двух пользователей подряд — оба попадают на главную', async ({
    page,
    registerPage,
  }) => {
    const u1 = buildUser({ username: uniqueUsername('first') })
    await registerPage.open()
    await registerPage.register(u1)
    await expect(page).not.toHaveURL(/\/register/, { timeout: 10_000 })

    // Выходим
    await page.getByRole('button', { name: 'Выйти' }).click()
    await page.waitForURL(/\/login/)

    const u2 = buildUser({ username: uniqueUsername('second') })
    await registerPage.open()
    await registerPage.register(u2)
    await expect(page).not.toHaveURL(/\/register/, { timeout: 10_000 })
    await registerPage.expectAuthenticated(u2.username)
  })
})
