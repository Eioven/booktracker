import { APIRequestContext, request, expect } from '@playwright/test'
import type { TestUser } from '@data/users'
import type { ManualBook, BookStatus } from '@data/books'

const DEFAULT_API_URL = process.env.API_URL ?? 'http://127.0.0.1:8000'

export interface AuthTokens {
  access: string
  refresh: string
}

export interface RegisterResponse {
  user: { id: number; username: string; email: string | null }
  tokens: AuthTokens
}

export interface BookApiPayload {
  id: number
  status: BookStatus
  current_page: number
  progress_percent: number
  rating: number | null
  book: {
    id: number
    title: string
    total_pages: number | null
  }
}

export interface GoalApiPayload {
  id: number
  period_type: 'year' | 'month'
  measure_type: 'books' | 'pages'
  target: number
  period_start: string
  period_end: string
  current_value: number
  progress_percent: number
}

export async function createApiContext(baseURL = DEFAULT_API_URL): Promise<APIRequestContext> {
  return request.newContext({
    baseURL,
    extraHTTPHeaders: { 'Content-Type': 'application/json' },
  })
}

export async function registerUser(
  api: APIRequestContext,
  user: TestUser,
): Promise<RegisterResponse> {
  const response = await api.post('/api/auth/register/', {
    data: {
      username: user.username,
      email: user.email,
      password: user.password,
      password_confirm: user.passwordConfirm,
    },
  })
  expect(response.status(), `registerUser ${user.username}`).toBe(201)
  return (await response.json()) as RegisterResponse
}

export async function loginUser(
  api: APIRequestContext,
  username: string,
  password: string,
): Promise<RegisterResponse> {
  const response = await api.post('/api/auth/login/', {
    data: { username, password },
  })
  expect(response.ok(), `loginUser ${username}`).toBeTruthy()
  return (await response.json()) as RegisterResponse
}

export async function createAuthorizedContext(
  user: TestUser,
  baseURL = DEFAULT_API_URL,
): Promise<{ api: APIRequestContext; tokens: AuthTokens; userId: number }> {
  const unauthenticated = await createApiContext(baseURL)
  const { user: createdUser, tokens } = await registerUser(unauthenticated, user)
  await unauthenticated.dispose()

  const api = await request.newContext({
    baseURL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens.access}`,
    },
  })

  return { api, tokens, userId: createdUser.id }
}

export async function addBookViaApi(
  api: APIRequestContext,
  book: ManualBook,
  status: BookStatus = 'want_to_read',
): Promise<BookApiPayload> {
  const response = await api.post('/api/books/', {
    data: {
      status,
      book: {
        title: book.title,
        author: book.author,
        genre: book.genre,
        total_pages: book.totalPages,
        published_year: book.publishedYear,
      },
    },
  })
  expect(response.status(), `addBookViaApi ${book.title}`).toBe(201)
  return (await response.json()) as BookApiPayload
}

export async function updateUserBook(
  api: APIRequestContext,
  userBookId: number,
  patch: Partial<{
    status: BookStatus
    current_page: number
    rating: number
    review: string
    date_started: string
    date_finished: string
  }>,
): Promise<BookApiPayload> {
  const response = await api.patch(`/api/books/${userBookId}/`, { data: patch })
  expect(response.ok(), `updateUserBook ${userBookId}`).toBeTruthy()
  return (await response.json()) as BookApiPayload
}

export async function deleteUserBook(
  api: APIRequestContext,
  userBookId: number,
): Promise<void> {
  const response = await api.delete(`/api/books/${userBookId}/`)
  expect([200, 204]).toContain(response.status())
}

export async function listBooks(
  api: APIRequestContext,
  filters: { status?: BookStatus; search?: string } = {},
): Promise<BookApiPayload[]> {
  const response = await api.get('/api/books/', { params: filters })
  expect(response.ok()).toBeTruthy()
  return (await response.json()) as BookApiPayload[]
}

export async function createGoalViaApi(
  api: APIRequestContext,
  goal: {
    periodType: 'year' | 'month'
    measureType: 'books' | 'pages'
    target: number
    periodStart: string
    periodEnd: string
  },
): Promise<GoalApiPayload> {
  const response = await api.post('/api/goals/', {
    data: {
      period_type: goal.periodType,
      measure_type: goal.measureType,
      target: goal.target,
      period_start: goal.periodStart,
      period_end: goal.periodEnd,
    },
  })
  expect(response.status(), 'createGoalViaApi').toBe(201)
  return (await response.json()) as GoalApiPayload
}

export async function addNoteViaApi(
  api: APIRequestContext,
  userBookId: number,
  content: string,
): Promise<{ id: number; content: string }> {
  const response = await api.post(`/api/books/${userBookId}/notes/`, {
    data: { content },
  })
  expect(response.status(), 'addNoteViaApi').toBe(201)
  return (await response.json()) as { id: number; content: string }
}

export async function addQuoteViaApi(
  api: APIRequestContext,
  userBookId: number,
  content: string,
  pageNumber?: number,
): Promise<{ id: number; content: string }> {
  const response = await api.post(`/api/books/${userBookId}/quotes/`, {
    data: { content, page_number: pageNumber ?? null },
  })
  expect(response.status(), 'addQuoteViaApi').toBe(201)
  return (await response.json()) as { id: number; content: string }
}
