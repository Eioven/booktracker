import { uniqueUsername, uniqueEmail, strongPassword } from '@helpers/random'

export interface TestUser {
  username: string
  email: string
  password: string
  passwordConfirm: string
}

/** Свежий пользователь — каждый вызов генерирует новые значения. */
export function buildUser(overrides: Partial<TestUser> = {}): TestUser {
  const password = overrides.password ?? strongPassword()
  return {
    username: overrides.username ?? uniqueUsername(),
    email: overrides.email ?? uniqueEmail(),
    password,
    passwordConfirm: overrides.passwordConfirm ?? password,
  }
}

/** Заведомо несуществующие учётные данные — для негативного логина. */
export const NON_EXISTENT_USER = {
  username: 'no_such_user_zzz_404',
  password: 'whatever_pw_123!',
}

/**
 * Невалидные пароли, на которые срабатывают встроенные валидаторы Django:
 *   — слишком короткий,
 *   — состоит только из цифр,
 *   — слишком распространённый,
 *   — совпадает с username (UserAttributeSimilarityValidator).
 */
export const WEAK_PASSWORDS = {
  short: 'ab12',
  numericOnly: '12345678',
  common: 'password',
}
