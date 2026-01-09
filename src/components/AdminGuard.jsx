export function AdminGuard({ children }) {
  const token = sessionStorage.getItem('vander_admin_token')
  if (token === 'true') {
    return children
  }
  const next = `${window.location.pathname}${window.location.search || ''}`
  window.location.href = `/admin/login?next=${encodeURIComponent(next)}`
  return null
}
