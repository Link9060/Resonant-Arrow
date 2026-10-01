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
  let session = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    session = raw ? JSON.parse(raw) : null;
    accessToken = session?.access_token || '';
  } catch {}

  if (!accessToken) {
    goToLogin();
    return;
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 4500);

  async function verify() {
    try {
      if(session?.refresh_token && session.expires_at && Number(session.expires_at)*1000<Date.now()+30000) {
        if(!window.__arrowSessionRefreshPromise) window.__arrowSessionRefreshPromise=(async()=>{
          const response=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:SUPABASE_KEY,'content-type':'application/json'},body:JSON.stringify({refresh_token:session.refresh_token}),signal:controller.signal});
          if(!response.ok)return null;const fresh={...session,...await response.json()};localStorage.setItem(STORAGE_KEY,JSON.stringify(fresh));return fresh;
        })();
        try{const fresh=await window.__arrowSessionRefreshPromise;if(fresh)accessToken=fresh.access_token;}finally{window.__arrowSessionRefreshPromise=null;}
      }
      const headers={apikey:SUPABASE_KEY,authorization:`Bearer ${accessToken}`};
      const response=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers,signal:controller.signal});
      if(response.status===401||response.status===403){goToLogin();return;}
      if(!response.ok){reveal();return;}
      const user=await response.json();
      const profileResponse=await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=banned_at`,{headers,signal:controller.signal});
      if(profileResponse.ok){const profiles=await profileResponse.json();if(profiles[0]?.banned_at){
        reveal();document.body.replaceChildren();const main=document.createElement('main');main.style.cssText='max-width:560px;margin:10vh auto;padding:24px;font:16px system-ui;line-height:1.6';
        const title=document.createElement('h1');title.textContent='Account suspended';const copy=document.createElement('p');copy.textContent='This account cannot access ARROW. Contact Resonant Assist support if you believe this is a mistake.';const signout=document.createElement('a');signout.href='/signout/';signout.textContent='Sign out';main.append(title,copy,signout);document.body.append(main);return;
      }}
      reveal();
    }catch{reveal();}finally{window.clearTimeout(timer);}
  }
  void verify();
})();
