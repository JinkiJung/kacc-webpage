// Public configuration only. Never put Worker secrets here.
(() => {
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  window.KACC_GUESTBOOK_CONFIG = Object.freeze({
    apiBase: local ? `http://${location.hostname}:8787` : 'https://jinki-game-leaderboard.jinki-game-leaderboard.workers.dev',
    // Production public sitekey; the secret is stored only in the private Worker.
    turnstileSiteKey: local ? '1x00000000000000000000AA' : '0x4AAAAAAFOYvQaWF9liIg6O',
  });
})();
