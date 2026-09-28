(() => {
  const SUPABASE_URL = 'https://cnorozrjugxpanpfmssa.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_yVNPiB7opT0WRvBfKTZ2BA_s5bOQLRg';
  const NEXT_KEY = 'arrow-auth-next-v1';
  const state = document.getElementById('callbackState');
  const errorEl = document.getElementById('callbackError');

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: false,
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  function safeNext(value) {
    if (!value || !value.startsWith('/') || value.startsWith('//')) return null;
    try {
      const parsed = new URL(value, window.location.origin);
      if (parsed.origin !== window.location.origin) return null;
      const allowed = ['/orbit/', '/relay/', '/ravin/', '/atlas/', '/waypoint/'];
      return allowed.some(prefix => parsed.pathname.startsWith(prefix))
        ? parsed.pathname + parsed.search + parsed.hash
        : null;
    } catch {
      return null;
    }
  }

  function destination() {
    let target = null;
    try { target = safeNext(localStorage.getItem(NEXT_KEY)); } catch {}
    try { localStorage.removeItem(NEXT_KEY); } catch {}
    return target || '/orbit/';
  }

  function finishToCenter() {
    window.location.replace(destination());
  }

  function fail(message) {
    state.hidden = true;
    errorEl.textContent = message || 'ARROW could not finish sign in.';
  }

  async function finish() {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const callbackError = params.get('error_description');
    if (callbackError) {
      fail(decodeURIComponent(callbackError.replaceAll('+', ' ')));
      return;
    }

    const code = params.get('code');
    const flowId = params.get('sb_flow_id');
    const tokenHash = params.get('token_hash');
    const type = params.get('type');

    if (tokenHash && type) {
      const { data, error } = await client.auth.verifyOtp({ token_hash: tokenHash, type });
      if (error || !data.session) {
        fail(error?.message || 'This ARROW sign-in link is no longer usable.');
        return;
      }
      finishToCenter();
      return;
    }

    if (code) {
      const { data, error } = await client.auth.exchangeCodeForSession(
        code,
        flowId ? { flowId } : undefined,
      );
      if (error || !data.session) {
        fail(error?.message || 'ARROW could not exchange the sign-in code.');
        return;
      }
      finishToCenter();
      return;
    }

    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const accessToken = hash.get('access_token');
    const refreshToken = hash.get('refresh_token');

    if (accessToken && refreshToken) {
      const { error } = await client.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) {
        fail(error.message);
        return;
      }
      history.replaceState({}, document.title, window.location.pathname);
      finishToCenter();
      return;
    }

    const { data: { session } } = await client.auth.getSession();
    if (session) {
      finishToCenter();
      return;
    }

    fail('This sign-in link is no longer usable. Return to enterarrow.com and request a fresh one.');
  }

  void finish().catch(error => fail(error?.message));
})();