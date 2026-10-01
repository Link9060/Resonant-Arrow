(() => {
  const HOSTS = new Set(['enterarrow.com', 'www.enterarrow.com']);
  if (!HOSTS.has(window.location.hostname)) return;

  const CENTER_PREFIXES = ['/orbit/', '/relay/', '/ravin/', '/atlas/', '/waypoint/'];
  const currentPath = window.location.pathname.endsWith('/')
    ? window.location.pathname
    : window.location.pathname + '/';

  if (!CENTER_PREFIXES.some(prefix => currentPath.startsWith(prefix))) return;

  const SUPABASE_URL = 'https://cnorozrjugxpanpfmssa.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_yVNPiB7opT0WRvBfKTZ2BA_s5bOQLRg';
  const STORAGE_KEY = 'sb-cnorozrjugxpanpfmssa-auth-token';
  const NEXT_KEY = 'arrow-auth-next-v1';
  const next = window.location.pathname + window.location.search + window.location.hash;

  const reveal = () => {
    document.documentElement.style.visibility = '';
    document.documentElement.removeAttribute('data-arrow-auth-checking');
  };

  const goToLogin = () => {
    try { localStorage.setItem(NEXT_KEY, next); } catch {}
    const url = new URL('/', window.location.origin);
    url.searchParams.set('next', next);
    window.location.replace(url.toString());
  };

  document.documentElement.dataset.arrowAuthChecking = 'true';
  document.documentElement.style.visibility = 'hidden';

  let accessToken = '';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const session = raw ? JSON.parse(raw) : null;
    accessToken = session?.access_token || '';
  } catch {}

  if (!accessToken) {
    goToLogin();
    return;
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 4500);

  fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_KEY,
      authorization: `Bearer ${accessToken}`,
    },
    signal: controller.signal,
  })
    .then(response => {
      window.clearTimeout(timer);
      if (response.ok) {
        reveal();
        return;
      }
      if (response.status === 401 || response.status === 403) {
        goToLogin();
        return;
      }
      reveal();
    })
    .catch(() => {
      window.clearTimeout(timer);
      // Do not lock users out during a temporary network failure.
      reveal();
    });
})();