const tog = document.getElementById('tog');

function render(state) {
  if (state) {
    tog.classList.add('on');
    tog.textContent = 'Enabled';
  } else {
    tog.classList.remove('on');
    tog.textContent = 'Disabled';
  }
}

chrome.storage.sync.get({ enabled: true }, s => {
  render(!!s.enabled);
});

tog.addEventListener('click', () => {
  chrome.storage.sync.get({ enabled: true }, s => {
    const next = !s.enabled;
    chrome.storage.sync.set({ enabled: next }, () => render(next));
  });
});
