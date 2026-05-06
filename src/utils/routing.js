export function normalizePathname(pathname = '/') {
  if (!pathname || pathname === '') return '/';
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

export const ADMIN_DASHBOARD_PATH = '/admin/dashboard';

export function isAdminDashboardPath(pathname) {
  return normalizePathname(pathname) === ADMIN_DASHBOARD_PATH;
}

/** `/shop/:userId` — seller boutique page */
export function matchShopPath(pathname) {
  const p = normalizePathname(pathname);
  const m = p.match(/^\/shop\/([^/]+)$/);
  if (!m) return null;
  try {
    return { userId: decodeURIComponent(m[1]) };
  } catch {
    return { userId: m[1] };
  }
}

export function shopPathForUser(userId) {
  if (!userId) return '/';
  return `/shop/${encodeURIComponent(userId)}`;
}

export function subscribePathname(onChange) {
  function handler() {
    onChange(normalizePathname(window.location.pathname));
  }
  window.addEventListener('popstate', handler);
  return () => window.removeEventListener('popstate', handler);
}

export function pushPath(nextPathname) {
  const next = normalizePathname(nextPathname);
  window.history.pushState({}, '', next);
}
