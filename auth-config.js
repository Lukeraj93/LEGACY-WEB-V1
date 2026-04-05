(function initLegacyAuthConfig() {
  const hostname = String(window.location.hostname || "").toLowerCase();
  const port = String(window.location.port || "");
  const isLocalHost = hostname === "127.0.0.1" || hostname === "localhost";
  const localAppHost = hostname === "localhost" ? "localhost" : "127.0.0.1";
  const localAppOrigin = `http://${localAppHost}:8888`;

  if (isLocalHost && port === "8091") {
    const targetUrl = `${localAppOrigin}${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (targetUrl !== window.location.href) {
      window.location.replace(targetUrl);
      return;
    }
  }

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
    appOrigin: localAppOrigin,
  };

  window.LEGACY_AUTH_CONFIG = isLocalHost ? localConfig : productionConfig;
})();
