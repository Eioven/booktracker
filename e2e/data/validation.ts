/**
 * Эталонные тексты валидационных сообщений.
 * Если фронтенд изменит локализацию — достаточно обновить значения здесь.
 */

export const AUTH_ERRORS = {
  loginRequired: 'Имя пользователя и пароль обязательны',
  registerPasswordMismatch: 'Пароли не совпадают',
  invalidCredentials: 'Неверное имя пользователя или пароль',
  usernameExists: 'A user with that username already exists',
}

export const LIBRARY_ERRORS = {
  duplicateBook: 'Эта книга уже есть в вашей библиотеке',
}

export const BOOK_ERRORS = {
  pageBeyondTotal: 'не может превышать',
}

export const GOAL_ERRORS = {
  invalidPeriod: 'Дата окончания должна быть позже даты начала',
}

export const COVER_ERRORS = {
  invalidType: 'Допустимые форматы: JPEG, PNG, WebP, GIF',
  tooBig: 'не должен превышать 5 МБ',
}
