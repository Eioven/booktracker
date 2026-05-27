import { uniqueUsername, uniqueEmail, strongPassword } from '@helpers/random'

export interface TestUser {
  username: string
  email: string
  password: string
  passwordConfirm: string
}

export function buildUser(overrides: Partial<TestUser> = {}): TestUser {
  const password = overrides.password ?? strongPassword()
  return {
    username: overrides.username ?? uniqueUsername(),
    email: overrides.email ?? uniqueEmail(),
    password,
    passwordConfirm: overrides.passwordConfirm ?? password,
  }
}

export const NON_EXISTENT_USER = {
  username: 'no_such_user_zzz_404',
  password: 'whatever_pw_123!',
}

export const WEAK_PASSWORDS = {
  short: 'ab12',
  numericOnly: '12345678',
  common: 'password',
}
