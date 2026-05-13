(function initConfig() {
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1';

  window.ANAYA_CONFIG = {
    API_BASE_URL: window.__ANAYA_API_BASE_URL__ || (isLocal ? 'http://localhost:5050' : window.location.origin),
    API_PREFIX: '/api'
  };
})();
