const STORAGE_KEY = 'customAdSelectors';

async function load() {
  const res = await chrome.storage.sync.get({ [STORAGE_KEY]: '' });
  document.getElementById('custom').value = res[STORAGE_KEY] || '';
}

async function save() {
  const val = document.getElementById('custom').value || '';
  await chrome.storage.sync.set({ [STORAGE_KEY]: val });
  flash('Saved');
}

async function reset() {
  await chrome.storage.sync.set({ [STORAGE_KEY]: '' });
  await load();
  flash('Reset');
}

let t = null;
function flash(msg) {
  const el = document.getElementById('status');
  el.textContent = msg;
  clearTimeout(t);
  t = setTimeout(() => (el.textContent = ''), 1200);
}

document.getElementById('save').addEventListener('click', save);
document.getElementById('reset').addEventListener('click', reset);

load();
