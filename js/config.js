// ============================================
// ANAYA COUTURE — API Configuration
// ============================================

const Config = {
  // API base URL: reads from window.ANAYA_API_URL if injected at deploy time,
  // otherwise falls back to a relative /api path (if frontend is served behind a proxy)
  // or a localhost default for local development.
  apiBase: (function () {
    if (typeof window !== 'undefined' && window.ANAYA_API_URL) {
      return window.ANAYA_API_URL.replace(/\/$/, '');
    }
    // If served on same origin with a proxy (e.g. Vercel rewrites /api → backend)
    // or separately on localhost:5050
    return (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
      ? '/api'
      : 'http://localhost:5050/api';
  })()
};

if (typeof window !== 'undefined') window.Config = Config;
