import { test as base, expect, type APIRequestContext, type Page } from '@playwright/test'
import {
  createApiContext,
  createAuthorizedContext,
  addBookViaApi,
  type BookApiPayload,
  type AuthTokens,
} from '@api/booktracker'
import { buildUser, type TestUser } from '@data/users'
import { buildManualBook, type BookStatus, type ManualBook } from '@data/books'
import { LoginPage } from '@pages/LoginPage'
import { RegisterPage } from '@pages/RegisterPage'
import { DashboardPage } from '@pages/DashboardPage'
import { LibraryPage } from '@pages/LibraryPage'
import { BookPage } from '@pages/BookPage'
import { GoalsPage } from '@pages/GoalsPage'
import { StatsPage } from '@pages/StatsPage'
import { ProfilePage } from '@pages/ProfilePage'

export interface LibraryWithBooks {
  user: TestUser
  tokens: AuthTokens
  userId: number
  books: BookApiPayload[]
  api: APIRequestContext
}

type Fixtures = {
  // API
  apiContext: APIRequestContext

  // Пользователи и данные
  freshUser: TestUser
  authenticatedPage: { page: Page; user: TestUser; tokens: AuthTokens; api: APIRequestContext }
  libraryWithBooks: LibraryWithBooks

  // Page Objects
  loginPage: LoginPage
  registerPage: RegisterPage
  dashboardPage: DashboardPage
  libraryPage: LibraryPage
  bookPage: BookPage
  goalsPage: GoalsPage
  statsPage: StatsPage
  profilePage: ProfilePage
}

/**
 * Положить токены в localStorage до загрузки приложения,
 * чтобы AuthContext подхватил их при инициализации.
 */
async function seedAuthStorage(page: Page, user: TestUser, tokens: AuthTokens, userId: number) {
  await page.addInitScript(
    ([accessToken, refreshToken, payload]) => {
      window.localStorage.setItem('access_token', accessToken as string)
      window.localStorage.setItem('refresh_token', refreshToken as string)
      window.localStorage.setItem('user', payload as string)
    },
    [
      tokens.access,
      tokens.refresh,
      JSON.stringify({
        id: userId,
        username: user.username,
        email: user.email,
      }),
    ],
  )
}

export const test = base.extend<Fixtures>({
  // Неавторизованный API-контекст — для регистрации, негативных проверок логина
  apiContext: async ({}, use) => {
    const api = await createApiContext()
    await use(api)
    await api.dispose()
  },

  // Свежие данные пользователя (не зарегистрирован)
  freshUser: async ({}, use) => {
    await use(buildUser())
  },

  // Зарегистрированный пользователь + страница с подложенными токенами
  authenticatedPage: async ({ page }, use) => {
    const user = buildUser()
    const { api, tokens, userId } = await createAuthorizedContext(user)
    await seedAuthStorage(page, user, tokens, userId)
    await use({ page, user, tokens, api })
    await api.dispose()
  },

  // Готовая библиотека с тремя книгами: want_to_read, reading, finished
  libraryWithBooks: async ({ page }, use) => {
    const user = buildUser()
    const { api, tokens, userId } = await createAuthorizedContext(user)
    const seed: Array<{ overrides: Partial<ManualBook>; status: BookStatus }> = [
      { overrides: { title: 'Fixture · Хочу прочитать' }, status: 'want_to_read' },
      { overrides: { title: 'Fixture · Сейчас читаю', totalPages: 300 }, status: 'reading' },
      { overrides: { title: 'Fixture · Прочитал', totalPages: 250 }, status: 'finished' },
    ]
    const books: BookApiPayload[] = []
    for (const item of seed) {
      const created = await addBookViaApi(api, buildManualBook(item.overrides), item.status)
      books.push(created)
    }
    await seedAuthStorage(page, user, tokens, userId)
    await use({ user, tokens, userId, books, api })
    await api.dispose()
  },

  // Page Objects
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
  dashboardPage: async ({ page }, use) => use(new DashboardPage(page)),
  libraryPage: async ({ page }, use) => use(new LibraryPage(page)),
  bookPage: async ({ page }, use) => use(new BookPage(page)),
  goalsPage: async ({ page }, use) => use(new GoalsPage(page)),
  statsPage: async ({ page }, use) => use(new StatsPage(page)),
  profilePage: async ({ page }, use) => use(new ProfilePage(page)),
})

export { expect }
