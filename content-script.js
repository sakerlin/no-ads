import { DEFAULT_AD_SELECTORS } from './default-selectors.js';

const STORAGE_KEY = 'customAdSelectors';

function uniq(arr) {
  return Array.from(new Set(arr.filter(Boolean)));
}

async function getCustomSelectors() {
  try {
    const res = await chrome.storage.sync.get({ [STORAGE_KEY]: '' });
    const raw = res[STORAGE_KEY] || '';
    return raw
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith('#'));
  } catch {
    return [];
  }
}

function hideElements(selectors) {
  let hidden = 0;
  for (const sel of selectors) {
    try {
      const nodes = document.querySelectorAll(sel);
      nodes.forEach((n) => {
        if (!n) return;
        // do not re-hide if already hidden
        const style = n.style;
        if (style && style.display === 'none') return;
        n.setAttribute('data-no-ads-hidden', '1');
        n.style.setProperty('display', 'none', 'important');
        hidden++;
      });
    } catch {
      // invalid selector
    }
  }
  return hidden;
}

let scheduled = false;
let lastRun = 0;

async function run() {
  scheduled = false;
  const now = Date.now();
  if (now - lastRun < 400) return; // throttle
  lastRun = now;

  const custom = await getCustomSelectors();
  const selectors = uniq([...DEFAULT_AD_SELECTORS, ...custom]);
  hideElements(selectors);
}

function schedule() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(run);
}

// Initial
schedule();

// Observe dynamic DOM
const obs = new MutationObserver(() => schedule());
obs.observe(document.documentElement, { childList: true, subtree: true });

// React to option changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return;
  if (changes[STORAGE_KEY]) schedule();
});
