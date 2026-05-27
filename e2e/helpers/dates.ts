

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function today(): string {
  return formatDate(new Date())
}

export function daysFromNow(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return formatDate(date)
}

export function startOfYear(year = new Date().getFullYear()): string {
  return `${year}-01-01`
}

export function endOfYear(year = new Date().getFullYear()): string {
  return `${year}-12-31`
}

export function startOfMonth(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
}

export function endOfMonth(date = new Date()): string {
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return formatDate(last)
}
