(function initLegacyAuthConfig() {
  const hostname = String(window.location.hostname || "").toLowerCase();
  const isLocalHost = hostname === "127.0.0.1" || hostname === "localhost";

  const productionConfig = {
    supabaseUrl: "https://ejitroflboctigjubyvm.supabase.co",
    supabaseAnonKey:
      "sb_publishable_jFgALGmbMm-M_IXWE89-2Q_quLxl0Fe",
    coachAccessCode: "",
  };

  const localConfig = {
    supabaseUrl: "http://127.0.0.1:54321",
    supabaseAnonKey: "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH",
    coachAccessCode: "",
  };

  window.LEGACY_AUTH_CONFIG = isLocalHost ? localConfig : productionConfig;
})();
