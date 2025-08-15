(() => {
  let enabled = true;
  let target = 'highres';
  const order = ['highres','hd2880','hd2160','hd1440','hd1080','hd720','large','medium','small','tiny'];

  function getPlayer() {
    const ytd = document.querySelector('ytd-player');
    if (ytd && typeof ytd.getPlayer === 'function') {
      const p = ytd.getPlayer();
      if (p && typeof p.getAvailableQualityLevels === 'function') return p;
    }
    const el = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
    if (el && typeof el.getAvailableQualityLevels === 'function') return el;
    return null;
  }

  function pickHighest(levels) {
    if (!levels || !levels.length) return target;
    const set = new Set(levels);
    for (const q of order) if (set.has(q)) return q;
    return levels[0];
  }

  function writeStorage(q) {
    const now = Date.now();
    const exp = now + 30*24*60*60*1000;
    try { localStorage.setItem('yt-player-quality', JSON.stringify({ data: q, expiration: exp, creation: now })); } catch {}
  }

  function applyOnce() {
    if (!enabled) return;
    const p = getPlayer();
    if (!p) return;
    const levels = (p.getAvailableQualityLevels && p.getAvailableQualityLevels()) || [];
    const q = pickHighest(levels);
    try { p.setPlaybackQualityRange && p.setPlaybackQualityRange(q); } catch {}
    try { p.setPlaybackQuality && p.setPlaybackQuality(q); } catch {}
    writeStorage(q);
  }

  function burst() {
    if (!enabled) return;
    let n = 0;
    const t = setInterval(() => {
      applyOnce();
      if (++n >= 20) clearInterval(t);
    }, 400);
  }

  function onVideoAttach() {
    const v = document.querySelector('video');
    if (!v) return;
    v.addEventListener('loadeddata', burst, { passive: true });
    v.addEventListener('playing', burst, { passive: true });
  }

  function onNavigate() {
    if (!enabled) return;
    applyOnce();
    burst();
    onVideoAttach();
  }

  window.addEventListener('yt-navigate-finish', onNavigate, { passive: true });
  window.addEventListener('yt-page-data-updated', onNavigate, { passive: true });
  window.addEventListener('DOMContentLoaded', onNavigate, { passive: true });

  window.addEventListener('message', e => {
    const m = e.data || {};
    if (m.type === 'YTMQ_INIT' || m.type === 'YTMQ_UPDATE') {
      if (typeof m.enabled === 'boolean') enabled = m.enabled;
      if (typeof m.target === 'string') target = m.target;
      if (m.type === 'YTMQ_INIT') onNavigate();
    }
  });
})();
