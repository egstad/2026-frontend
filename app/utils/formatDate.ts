/**
 * Format a date string consistently for SSR
 * Uses fixed format to avoid hydration mismatches
 */
export function formatDate(date: string, options?: {long?: boolean}): string {
  const d = new Date(date)

  if (isNaN(d.getTime())) {
    return ''
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthsLong = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const month = options?.long ? monthsLong[d.getUTCMonth()] : months[d.getUTCMonth()]
  const day = d.getUTCDate()
  const year = d.getUTCFullYear()

  return `${month} ${day}, ${year}`
}

/**
 * Format a relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) === 1 ? '' : 's'} ago`
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) === 1 ? '' : 's'} ago`
}
