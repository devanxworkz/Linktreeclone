/**
 * ChatIQ — Supabase Client
 *
 * Initializes a Supabase client using the globally injected config.
 * Logs warnings for debugging when credentials are missing.
 *
 * @returns {object|null} Supabase client instance or null if not configured.
 */
(function () {
  var SUPABASE_URL = '';
  var SUPABASE_ANON_KEY = '';

  try {
    var cfg = window.__CHATIQ_CONFIG__ || {};
    SUPABASE_URL = cfg.supabaseUrl || '';
    SUPABASE_ANON_KEY = cfg.supabaseAnonKey || '';
  } catch (e) {
    console.warn('[ChatIQ Supabase] Config not available.', e);
  }

  var client = null;

  console.log('CONFIG:', window.__CHATIQ_CONFIG__);
  console.log('SUPABASE_URL:', SUPABASE_URL);
  console.log('SUPABASE_ANON_KEY exists:', !!SUPABASE_ANON_KEY);

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn(
      '[ChatIQ Supabase] Missing credentials. Set supabaseUrl and supabaseAnonKey in __CHATIQ_CONFIG__.'
    );
  } else if (typeof supabase === 'undefined') {
    console.warn('[ChatIQ Supabase] @supabase/supabase-js library not loaded.');
  } else {
    client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('[ChatIQ Supabase] Client initialized successfully.');
  }

  window.__CHATIQ_SUPABASE__ = client;
})();
