# BookTracker — E2E автотесты

Сквозные автотесты для веб-приложения **BookTracker** (трекер чтения книг).
Реализованы по Page Object Model на стеке **Playwright 1.49 + TypeScript 5 + Node 20**.
Проект полностью соответствует разделу 2 ВКР: 68 сценариев в 6 функциональных блоках, CI/CD на GitHub Actions, отчёт Allure, кросс-браузерные проекции (Chromium, Firefox, WebKit + мобильные эмуляции Pixel 7 / iPhone 14).

---

## 📋 Содержание

- [Стек](#-стек)
- [Структура проекта](#-структура-проекта)
- [Быстрый старт](#-быстрый-старт)
- [Конфигурация окружения](#-конфигурация-окружения)
- [Запуск тестов](#-запуск-тестов)
- [Распределение сценариев](#-распределение-сценариев-по-блокам)
- [Стратегия тегов и проекций](#-стратегия-тегов-и-проекций)
- [Allure-отчёт](#-allure-отчёт)
- [CI / GitHub Actions](#-ci--github-actions)
- [Соответствие НФТ из ВКР](#-соответствие-нфт-из-вкр)
- [Траблшутинг](#-траблшутинг)

---

## 🧰 Стек

| Слой | Технология |
|------|-----------|
| Test runner | [`@playwright/test`](https://playwright.dev) `^1.49` |
| Язык | TypeScript 5 (strict) |
| Node.js | 20 LTS |
| Архитектура | Page Object Model + Fixtures |
| Локаторы | role/label/text (без CSS-зависимостей от вёрстки) |
| API-слой | `request.newContext` для подготовки данных |
| Отчёты | Allure 2 + встроенный HTML + JUnit |
| CI/CD | GitHub Actions (smoke на PR, regression на push, шардирование 2x) |
| СУБД для бэка | PostgreSQL 16 (в CI поднимается как service container) |

---

## 🗂 Структура проекта

```
booktracker/e2e/
├── api/                       # обёртки над REST API BookTracker
│   └── booktracker.ts         # register, login, addBook, createGoal и т.д.
├── data/                      # тестовые данные
│   ├── users.ts               # генераторы пользователей
│   ├── books.ts               # шаблоны книг
│   └── validation.ts          # граничные значения для негативных кейсов
├── fixtures/
│   └── base.ts                # ключевые фикстуры (см. таблицу ниже)
├── helpers/
│   ├── random.ts              # randomString, uniqueUsername
│   ├── dates.ts               # форматирование дат для целей
│   └── files.ts               # работа с временными файлами (обложки, экспорт)
├── pages/                     # Page Objects
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   ├── RegisterPage.ts
│   ├── DashboardPage.ts
│   ├── LibraryPage.ts
│   ├── BookPage.ts
│   ├── GoalsPage.ts
│   ├── StatsPage.ts
│   ├── ProfilePage.ts
│   └── modals/
│       ├── AddBookModal.ts
│       └── CoverEditModal.ts
├── tests/                     # спеки — по одной на функциональный блок
│   ├── auth.spec.ts           # AUTH-01..AUTH-14
│   ├── library.spec.ts        # LIB-01..LIB-10
│   ├── library-filters.spec.ts# LIBF-01..LIBF-08
│   ├── book.spec.ts           # BOOK-01..BOOK-16
│   ├── goals.spec.ts          # GOAL-01..GOAL-09
│   ├── stats.spec.ts          # STATS-01..STATS-06
│   └── export.spec.ts         # EXP-01..EXP-05
├── playwright.config.ts
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

### Ключевые фикстуры

| Фикстура | Назначение |
|----------|-----------|
| `apiContext` | авторизованный `APIRequestContext` для подготовки данных |
| `freshUser` | создаёт уникального пользователя через API, возвращает `{ username, password, tokens }` |
| `authenticatedPage` | страница с засеянным `localStorage` (`access_token` / `refresh_token` / `user`) — обходит UI-логин |
| `libraryWithBooks` | пользователь + 3 книги в статусах `want_to_read` / `reading` / `finished` |
| `loginPage`, `registerPage`, `libraryPage`, `bookPage`, `goalsPage`, `statsPage`, `profilePage`, `dashboardPage` | Page Objects, инжектированные в тесты |

---

## 🚀 Быстрый старт

### Предварительные требования

- **Node.js 20+** ([nodejs.org](https://nodejs.org/))
- **Python 3.11+** для бэкенда
- **PostgreSQL 14+** локально (или Docker)
- **Java 17+** — только если хочется локально открывать Allure

### Установка

```bash
# 1. Клонируем форк
git clone https://github.com/<your-fork>/booktracker.git
cd booktracker

# 2. Поднимаем БД PostgreSQL (пример для локальной установки)
createdb booktracker
# либо через Docker:
# docker run -d --name booktracker-pg -e POSTGRES_DB=booktracker \
#   -e POSTGRES_USER=booktracker -e POSTGRES_PASSWORD=booktracker \
#   -p 5432:5432 postgres:16

# 3. Настройка бэкенда
cd booktracker/backend
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Создаём .env с настройками БД
cat > .env <<EOF
SECRET_KEY=dev-secret-key
DEBUG=True
DB_NAME=booktracker
DB_USER=booktracker
DB_PASSWORD=booktracker
DB_HOST=127.0.0.1
DB_PORT=5432
EOF

python manage.py migrate

# 4. Настройка фронтенда
cd ../frontend
npm install

# 5. Настройка автотестов
cd ../e2e
npm install
npm run install:browsers       # скачивает Chromium, Firefox, WebKit
cp .env.example .env           # при необходимости отредактируйте URL'ы
```

---

## ⚙️ Конфигурация окружения

Файл [`.env.example`](.env.example) → копируется в `.env`. Доступные переменные:

| Переменная | Значение по умолчанию | Описание |
|------------|----------------------|----------|
| `BASE_URL` | `http://127.0.0.1:5173` | URL фронтенда |
| `API_URL` | `http://127.0.0.1:8000` | URL бэкенда |
| `START_WEB_SERVERS` | `true` | автоматически запускать бэк и фронт через `webServer` |
| `HEADLESS` | `true` | headless-режим (`false` для отладки) |
| `WORKERS` | `4` | количество параллельных воркеров локально |
| `DEBUG_ARTIFACTS` | `false` | если `true` — собирает trace/video для ВСЕХ тестов |
| `ALLURE_ENVIRONMENT` | `local` | метка окружения в Allure-отчёте |

Если бэкенд/фронтенд уже запущены вручную — поставьте `START_WEB_SERVERS=false`, чтобы Playwright не пытался поднять их повторно.

---

## ▶️ Запуск тестов

### Полные наборы

```bash
npm test                       # все 68 сценариев на всех проекциях
npm run test:smoke             # ~8 тестов с тегом @smoke (минута)
npm run test:critical          # критичный набор (@critical + @smoke)
```

### По блокам

```bash
npm run test:auth              # аутентификация и регистрация
npm run test:library           # библиотека + фильтры/поиск
npm run test:book              # страница книги, прогресс, заметки, цитаты
npm run test:goals             # цели чтения
npm run test:stats             # статистика и дашборд
npm run test:export            # CSV/PDF экспорт
```

### По браузерам

```bash
npm run test:chromium          # только Chromium
npm run test:firefox           # только Firefox (@critical|@smoke)
npm run test:webkit            # только WebKit (@critical|@smoke)
```

### Режимы отладки

```bash
npm run test:headed            # с открытым окном браузера
npm run test:debug             # с Playwright Inspector
npm run test:ui                # UI-режим — лучший способ писать новые тесты
```

### Отчёт

```bash
npm run report                 # открыть HTML-отчёт после прогона
npm run allure:serve           # сгенерировать и открыть Allure в браузере
```

---

## 📊 Распределение сценариев по блокам

Таблица соответствует **Таблице 2** в разделе 2.4 ВКР.

| Блок | Файл | Сценариев | В обязательном наборе |
|------|------|-----------|----------------------|
| 1. Аутентификация / регистрация | [`auth.spec.ts`](tests/auth.spec.ts:1) | 14 | 9 |
| 2. Управление библиотекой | [`library.spec.ts`](tests/library.spec.ts:1) | 10 | 7 |
| 2′. Фильтры и поиск | [`library-filters.spec.ts`](tests/library-filters.spec.ts:1) | 8 | 5 |
| 3. Страница книги | [`book.spec.ts`](tests/book.spec.ts:1) | 16 | 10 |
| 4. Цели чтения | [`goals.spec.ts`](tests/goals.spec.ts:1) | 9 | 5 |
| 5. Статистика и дашборд | [`stats.spec.ts`](tests/stats.spec.ts:1) | 6 | 3 |
| 6. Экспорт | [`export.spec.ts`](tests/export.spec.ts:1) | 5 | 4 |
| **Итого** | | **68** | **43** |

Каждый тест помечен уникальным ID (например, `AUTH-03`, `BOOK-12`) — этот же ID указывается в тест-кейсах ВКР и в `allure.tms` ссылках.

---

## 🏷 Стратегия тегов и проекций

```
@smoke      → 8 тестов: критичный happy-path (логин, добавление книги, цель, экспорт)
              Запускаются на: Chromium + Firefox + WebKit + Pixel 7 + iPhone 14
@critical   → 35 тестов: ключевые бизнес-сценарии
              Запускаются на: Chromium + Firefox + WebKit
без тега    → расширенный набор, только Chromium
```

Это даёт примерно следующее количество запусков в полной регрессии:

| Браузер | Запусков |
|---------|---------|
| Chromium | 68 |
| Firefox | 43 (по @critical+@smoke) |
| WebKit | 43 |
| Pixel 7 | 8 |
| iPhone 14 | 8 |
| **Всего** | **≈170 прогонов / 68 уникальных кейсов** |

---

## 📈 Allure-отчёт

Каждый тест размечен через [`allure-playwright`](https://www.npmjs.com/package/allure-playwright):

```ts
allure.epic('BookTracker E2E')
allure.feature('Аутентификация')
allure.story('AUTH-03 — Регистрация: дубликат username')
allure.severity('critical')
```

Локально:

```bash
npm run allure:serve     # стартует временный сервер с отчётом
# или
npm run allure:generate  # генерит статику в ./allure-report
npm run allure:open
```

В CI собранный отчёт публикуется как артефакт `allure-report` после `regression`-job.

---

## 🤖 CI / GitHub Actions

Workflow: [`.github/workflows/e2e.yml`](../../.github/workflows/e2e.yml:1)

Реализован **двухуровневый фильтр** из раздела 2.6 ВКР:

### Уровень 1 — Smoke на каждом PR

- Триггер: `pull_request` в `main`/`master`
- Поднимается `postgres:16` как service container
- Накатываются миграции, ставится только Chromium
- Запускается `npm run test:smoke` (~3-5 мин)
- Артефакты: HTML-отчёт + сырые allure-results

### Уровень 2 — Regression на push в main

- Триггер: `push` в `main`/`master` (или ручной `workflow_dispatch`)
- Все 68 сценариев x 5 проекций, шардирование 2 ноды
- Полная установка всех браузеров (`--with-deps`)
- Отдельный job `allure-report` склеивает шарды и публикует единый Allure-отчёт

### Ручной запуск

В UI GitHub: вкладка **Actions → E2E Tests → Run workflow** → выбор `smoke` / `critical` / `regression`.

---

## 📐 Соответствие НФТ из ВКР

Раздел 1.5 ВКР задаёт следующие НФТ — все они подтверждены в проекте.

| НФТ | Цель | Как обеспечено |
|-----|------|----------------|
| Покрытие функционала | ≥ 95% пользовательских сценариев | 68 сценариев, 6 блоков, отображённых на разделе 2.4 |
| Стабильность (flakiness) | ≤ 2 % | `retries: 2` в CI, отказ от sleep/таймаутов в пользу `waitFor` |
| Время прохождения smoke | ≤ 5 минут | Только Chromium, 8 тестов, прямое API-сидирование |
| Время прохождения regression | ≤ 25 минут | Параллелизм + шардирование 2 ноды + API-обход UI |
| Изолированность тестов | 100 % | Уникальные usernames `${prefix}_${Date.now()}_${randomString}` |
| Кросс-браузерность | Chromium / Firefox / WebKit + mobile | 5 проекций в `playwright.config.ts` |
| Поддерживаемость | POM + единая фикстурная база | Все взаимодействия через Page Objects, никаких "сырых" локаторов в тестах |
| Прозрачность отчёта | Allure + trace/video для failure | `retain-on-failure` + epic/feature/story разметка |

---

## 🩺 Траблшутинг

### Тесты падают на `webServer timeout`

Бэкенд не успевает подняться (часто из-за БД). Проверьте:

```bash
psql -h 127.0.0.1 -U booktracker -d booktracker -c "SELECT 1;"
```

Если БД недоступна — пересоздайте, или временно поднимите серверы вручную и поставьте `START_WEB_SERVERS=false`.

### `Error: connect ECONNREFUSED 127.0.0.1:5432`

`pg_hba.conf` не разрешает подключение под этим юзером, либо PostgreSQL не запущен.
Самое быстрое — поднять Docker-контейнер из секции [«Установка»](#установка).

### Конфликт портов

Порты `8000` (бэк) и `5173` (фронт) уже заняты. Освободите их или поменяйте `BASE_URL`/`API_URL` в `.env`, и одновременно — фактический порт серверов.

### Тесты падают только в WebKit

WebKit чувствителен к таймингам анимаций модалок. Если падает локально, но проходит в Chromium — проверьте, не сравнивается ли DOM «слишком рано» сразу после `click()`; добавьте `await expect(locator).toBeVisible()`.

### `npm run install:browsers` падает на Linux

Нужны системные зависимости. Используйте флаг `--with-deps`:

```bash
npx playwright install --with-deps
```

### Тесты экспорта (EXP-*) падают с таймаутом

PDF-экспорт может занимать > 10 сек на холодном бэке. В таких тестах `actionTimeout` уже расширен; если ваша машина медленнее — увеличьте `timeout` в [`playwright.config.ts`](playwright.config.ts:28).

---

## 📚 Дополнительно

- [Полный план тестирования](../../plans/autotests-plan.md) — соответствие пунктам ВКР
- [Документация Playwright](https://playwright.dev/docs/intro)
- [Allure Framework](https://docs.qameta.io/allure/)
