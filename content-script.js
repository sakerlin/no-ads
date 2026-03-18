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
  let newlyHidden = 0;
  for (const sel of selectors) {
    try {
      const nodes = document.querySelectorAll(sel);
      nodes.forEach((n) => {
        if (!n) return;
        // only count elements we hide for the first time
        if (n.getAttribute('data-no-ads-hidden') === '1') return;

        n.setAttribute('data-no-ads-hidden', '1');
        n.style.setProperty('display', 'none', 'important');
        newlyHidden++;
      });
    } catch {
      // invalid selector
    }
  }
  return newlyHidden;
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
  const delta = hideElements(selectors);

  if (delta > 0) {
    try {
      chrome.runtime.sendMessage({ type: 'hiddenDelta', delta });
    } catch {
      // ignore
    }
  }
}

function schedule() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(run);
}

// Initial: reset count for this page, then run
try {
  chrome.runtime.sendMessage({ type: 'resetCount' });
} catch {}

schedule();

// Observe dynamic DOM
const obs = new MutationObserver(() => schedule());
obs.observe(document.documentElement, { childList: true, subtree: true });

// React to option changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return;
  if (changes[STORAGE_KEY]) schedule();
});
