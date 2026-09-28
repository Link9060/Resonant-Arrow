(() => {
  const SUPABASE_URL = 'https://cnorozrjugxpanpfmssa.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_yVNPiB7opT0WRvBfKTZ2BA_s5bOQLRg';
  const NEXT_KEY = 'arrow-auth-next-v1';

  const checking = document.getElementById('checking');
  const actions = document.getElementById('actions');
  const google = document.getElementById('google');
  const emailTab = document.getElementById('emailTab');
  const phoneTab = document.getElementById('phoneTab');
  const emailPanel = document.getElementById('emailPanel');
  const phonePanel = document.getElementById('phonePanel');
  const emailForm = document.getElementById('emailForm');
  const email = document.getElementById('email');
  const phoneForm = document.getElementById('phoneForm');
  const phone = document.getElementById('phone');
  const phoneVerifyForm = document.getElementById('phoneVerifyForm');
  const phoneCode = document.getElementById('phoneCode');
  const changePhone = document.getElementById('changePhone');
  const message = document.getElementById('message');

  let pendingPhone = '';

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: false,
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  const setMessage = (value) => { message.textContent = value || ''; };

  function safeNext(value) {
    if (!value || !value.startsWith('/') || value.startsWith('//')) return null;
    try {
      const parsed = new URL(value, window.location.origin);
      if (parsed.origin !== window.location.origin) return null;
      const allowed = ['/orbit/', '/relay/', '/ravin/', '/atlas/', '/waypoint/'];
      if (!allowed.some(prefix => parsed.pathname.startsWith(prefix))) return null;
      return parsed.pathname + parsed.search + parsed.hash;
    } catch {
      return null;
    }
  }

  function rememberRequestedDestination() {
    const url = new URL(window.location.href);
    const requested = safeNext(url.searchParams.get('next'));

    try {
      if (requested) {
        localStorage.setItem(NEXT_KEY, requested);
      } else {
        // A bare visit to the ARROW front door must never reuse an old center.
        // This prevents a stale Relay/RAVIN destination from becoming a loop.
        localStorage.removeItem(NEXT_KEY);
      }
    } catch {}
  }

  function destination() {
    let stored = null;
    try { stored = safeNext(localStorage.getItem(NEXT_KEY)); } catch {}
    return stored || '/orbit/';
  }

  function goToDestination() {
    const target = destination();
    try { localStorage.removeItem(NEXT_KEY); } catch {}
    window.location.replace(target);
  }

  function setMethod(method) {
    const phoneMode = method === 'phone';
    emailTab.classList.toggle('is-active', !phoneMode);
    phoneTab.classList.toggle('is-active', phoneMode);
    emailTab.setAttribute('aria-selected', phoneMode ? 'false' : 'true');
    phoneTab.setAttribute('aria-selected', phoneMode ? 'true' : 'false');
    emailPanel.hidden = phoneMode;
    phonePanel.hidden = !phoneMode;
    setMessage('');
  }

  function normalizePhone(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (raw.startsWith('+')) return '+' + raw.slice(1).replace(/\D/g, '');
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 10) return '+1' + digits;
    if (digits.length === 11 && digits.startsWith('1')) return '+' + digits;
    return digits ? '+' + digits : '';
  }

  async function boot() {
    rememberRequestedDestination();

    try {
      const [{ data: { user } }, settingsResponse] = await Promise.all([
        client.auth.getUser(),
        fetch(`${SUPABASE_URL}/auth/v1/settings`, {
          headers: { apikey: SUPABASE_KEY },
        }).catch(() => null),
      ]);

      if (user) {
        goToDestination();
        return;
      }

      if (settingsResponse?.ok) {
        const settings = await settingsResponse.json().catch(() => null);
        const googleEnabled = settings?.external?.google === true;
        google.hidden = !googleEnabled;
      }
    } catch {
      setMessage('ARROW could not check your session. You can still try a sign-in method below.');
    } finally {
      checking.hidden = true;
      actions.hidden = false;
    }
  }

  emailTab.addEventListener('click', () => setMethod('email'));
  phoneTab.addEventListener('click', () => setMethod('phone'));

  google.addEventListener('click', async () => {
    setMessage('');
    google.disabled = true;
    try {
      await client.auth.signOut({ scope: 'local' });
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback/`,
          scopes: 'openid email profile',
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error) throw error;
    } catch {
      setMessage('Google sign-in is unavailable right now. Use email or phone instead.');
      google.disabled = false;
    }
  });

  emailForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage('');
    const button = emailForm.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Sending…';

    try {
      await client.auth.signOut({ scope: 'local' });
      const { error } = await client.auth.signInWithOtp({
        email: email.value.trim().toLowerCase(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback/` },
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

  phoneForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage('');
    const button = phoneForm.querySelector('button[type="submit"]');
    const normalized = normalizePhone(phone.value);

    if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
      setMessage('Enter a valid mobile number with country code, like +1 555 123 4567.');
      return;
    }

    button.disabled = true;
    button.textContent = 'Sending…';

    try {
      await client.auth.signOut({ scope: 'local' });
      const { error } = await client.auth.signInWithOtp({ phone: normalized });
      if (error) throw error;
      pendingPhone = normalized;
      phoneForm.hidden = true;
      phoneVerifyForm.hidden = false;
      phoneCode.focus();
      setMessage('ARROW sent a 6-digit sign-in code by SMS.');
    } catch (error) {
      const raw = String(error?.message || '');
      const providerDisabled = /phone|sms|provider|unsupported|disabled/i.test(raw);
      setMessage(
        providerDisabled
          ? 'Phone sign-in is ready in ARROW, but SMS still needs to be enabled in Supabase Auth.'
          : raw || 'ARROW could not send the SMS code.'
      );
    } finally {
      button.disabled = false;
      button.textContent = 'Text me a sign-in code';
    }
  });

  phoneVerifyForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage('');
    const token = phoneCode.value.replace(/\D/g, '');
    const button = phoneVerifyForm.querySelector('button[type="submit"]');

    if (!pendingPhone || token.length !== 6) {
      setMessage('Enter the 6-digit code from the ARROW text message.');
      return;
    }

    button.disabled = true;
    button.textContent = 'Verifying…';

    try {
      const { data, error } = await client.auth.verifyOtp({
        phone: pendingPhone,
        token,
        type: 'sms',
      });
      if (error || !data.session) throw error || new Error('ARROW could not create a session.');
      goToDestination();
    } catch (error) {
      setMessage(error?.message || 'That code did not work. Request a new code and try again.');
    } finally {
      button.disabled = false;
      button.textContent = 'Verify and enter ARROW';
    }
  });

  changePhone.addEventListener('click', () => {
    pendingPhone = '';
    phoneCode.value = '';
    phoneVerifyForm.hidden = true;
    phoneForm.hidden = false;
    setMessage('');
    phone.focus();
  });

  void boot();
})();