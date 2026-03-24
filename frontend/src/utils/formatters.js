export function formatDate(value) {
  if (!value) {
    return 'Sin registro'
  }

  return new Date(value).toLocaleString()
}
