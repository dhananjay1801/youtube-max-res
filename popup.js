const tog = document.getElementById('tog');
const sel = document.getElementById('target');

chrome.storage.sync.get({ enabled: true, target: 'highres' }, s => {
  tog.checked = !!s.enabled;
  sel.value = s.target || 'highres';
});

tog.addEventListener('change', () => {
  chrome.storage.sync.set({ enabled: tog.checked });
});

sel.addEventListener('change', () => {
  chrome.storage.sync.set({ target: sel.value });
});
