/**
 * Тонкая обёртка над allure-js-commons (runtime API Allure 3.x).
 *
 * В Allure 3 функции `epic`, `feature`, `story`, `severity` и т.д. переехали
 * из `allure-playwright` в общий пакет `allure-js-commons`. Этот файл
 * реэкспортирует их под именем `allure`, чтобы в тестах можно было писать
 * привычное `allure.epic('...')`.
 */
export {
  epic,
  feature,
  story,
  severity,
  description,
  tag,
  tags,
  label,
  link,
  issue,
  tms,
  owner,
  parameter,
  attachment,
  step,
} from 'allure-js-commons'
