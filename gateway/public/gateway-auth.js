(() => {
  const SUPABASE_URL = 'https://cnorozrjugxpanpfmssa.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_yVNPiB7opT0WRvBfKTZ2BA_s5bOQLRg';
  const CALLBACK = () => `${window.location.origin}/auth/callback/`;
  const checking = document.getElementById('checking');
  const actions = document.getElementById('actions');
  const google = document.getElementById('google');
  const form = document.getElementById('emailForm');
  const email = document.getElementById('email');
  const message = document.getElementById('message');

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: false,
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  const setMessage = (value) => { message.textContent = value || ''; };

  async function boot() {
    try {
      const [{ data: { user } }, settingsResponse] = await Promise.all([
        client.auth.getUser(),
        fetch(`${SUPABASE_URL}/auth/v1/settings`, {
          headers: { apikey: SUPABASE_KEY },
        }).catch(() => null),
      ]);

      if (user) {
        window.location.replace('/orbit/');
        return;
      }

      let googleEnabled = false;
      if (settingsResponse?.ok) {
        const settings = await settingsResponse.json().catch(() => null);
        googleEnabled = settings?.external?.google === true;
      }

      google.hidden = !googleEnabled;
      const divider = document.querySelector('.divider');
      if (divider) divider.hidden = !googleEnabled;
    } catch {
      setMessage('ARROW could not check your session. Email sign-in is still available.');
    } finally {
      checking.hidden = true;
      actions.hidden = false;
    }
  }

  google.addEventListener('click', async () => {
    setMessage('');
    google.disabled = true;
    try {
      await client.auth.signOut({ scope: 'local' });
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: CALLBACK(),
          scopes: 'openid email profile',
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error) throw error;
    } catch {
      setMessage('Google sign-in is unavailable right now. Use the email option below.');
      google.disabled = false;
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage('');
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Sending…';

    try {
      await client.auth.signOut({ scope: 'local' });
      const { error } = await client.auth.signInWithOtp({
        email: email.value.trim().toLowerCase(),
        options: { emailRedirectTo: CALLBACK() },
      });
      if (error) throw error;
      setMessage('Sign-in link sent. Open the newest ARROW email in this browser.');
    } catch (error) {
      setMessage(error?.message || 'ARROW could not send the sign-in email.');
    } finally {
      button.disabled = false;
      button.textContent = 'Email me a sign-in link';
    }
  });

  void boot();
})();