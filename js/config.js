/**
 * ChatIQ — Application Configuration
 *
 * Reads Supabase credentials from a globally injected config object.
 * Set window.__CHATIQ_CONFIG__ before this script loads, or
 * the values will fall back to empty strings (requiring user configuration).
 *
 * In production, inject via an inline <script> tag in the HTML <head>:
 *
 *   <script>
 *     window.__CHATIQ_CONFIG__ = {
 *       supabaseUrl: "https://your-project.supabase.co",
 *       supabaseAnonKey: "your-anon-key"
 *     };
 *   </script>
 *
 * These values come from your .env file:
 *   NEXT_PUBLIC_SUPABASE_URL  -> supabaseUrl
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY -> supabaseAnonKey
 */
(function () {
  var cfg = window.__CHATIQ_CONFIG__ || {};

  window.__CHATIQ_CONFIG__ = {
    supabaseUrl: cfg.supabaseUrl || '',
    supabaseAnonKey: cfg.supabaseAnonKey || ''
  };
})();
