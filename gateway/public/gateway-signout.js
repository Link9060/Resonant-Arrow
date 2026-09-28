(() => {
  const SUPABASE_URL = 'https://cnorozrjugxpanpfmssa.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_yVNPiB7opT0WRvBfKTZ2BA_s5bOQLRg';
  const state = document.getElementById('signoutState');
  const errorEl = document.getElementById('signoutError');

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: false,
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  function clearBrowserAuth() {
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index);
      if (!key) continue;
      if (
        key.startsWith('sb-') ||
        key.toLowerCase().includes('supabase') ||
        key === 'arrow-dev-auth-bypass-v1'
      ) {
        localStorage.removeItem(key);
      }
    }

    for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = sessionStorage.key(index);
      if (!key) continue;
      if (key.startsWith('sb-') || key.toLowerCase().includes('supabase')) {
        sessionStorage.removeItem(key);
      }
    }
  }

  async function signOut() {
    try {
      await client.auth.signOut({ scope: 'local' });
    } catch (error) {
      errorEl.textContent = error?.message || '';
    } finally {
      clearBrowserAuth();
      state.textContent = 'Signed out';
      window.setTimeout(() => {
        window.location.replace('/?signed_out=1');
      }, 220);
    }
  }

  void signOut();
})();