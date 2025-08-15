(function(){
  const s = document.createElement('script');
  s.src = chrome.runtime.getURL('injected.js');
  (document.head || document.documentElement).appendChild(s);
  s.onload = () => s.remove();

  function sync() {
    chrome.storage.sync.get({ enabled: true, target: 'highres' }, d => {
      window.postMessage({ type: 'YTMQ_INIT', enabled: !!d.enabled, target: d.target }, '*');
    });
  }
  sync();

  chrome.storage.onChanged.addListener(ch => {
    const payload = { type: 'YTMQ_UPDATE' };
    if (ch.enabled) payload.enabled = ch.enabled.newValue;
    if (ch.target) payload.target = ch.target.newValue;
    window.postMessage(payload, '*');
  });
})();
