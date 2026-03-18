// MV3 service worker
// - enable DNR ruleset
// - maintain per-tab hidden count and show it as toolbar badge

const tabCounts = new Map();

function safeActionCall(fn) {
  try {
    fn();
    // eslint-disable-next-line no-undef
    if (chrome?.runtime?.lastError) {
      // ignore
    }
  } catch {
    // ignore
  }
}

function setBadge(tabId, count) {
  const text = count > 0 ? String(count) : '';
  console.log('[no-ads] setBadge', { tabId, count, text });
  safeActionCall(() => chrome.action.setBadgeText({ tabId, text }));
  // always set background so it's visible
  safeActionCall(() => chrome.action.setBadgeBackgroundColor({ tabId, color: '#e11d48' }));
}

chrome.runtime.onInstalled.addListener(async () => {
  try {
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: ['ruleset_1'],
      disableRulesetIds: [],
    });
  } catch {
    // ignore
  }

  // Set a default badge color (Chrome may not show badge without it in some themes)
  safeActionCall(() => chrome.action.setBadgeBackgroundColor({ color: '#e11d48' }));
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  const tabId = sender?.tab?.id;
  console.log('[no-ads] onMessage', { msg, tabId, url: sender?.tab?.url });
  if (tabId == null) return;

  if (msg?.type === 'resetCount') {
    tabCounts.set(tabId, 0);
    setBadge(tabId, 0);
    return;
  }

  if (msg?.type === 'hiddenDelta') {
    const delta = Number(msg.delta) || 0;
    const next = (tabCounts.get(tabId) || 0) + Math.max(0, delta);
    tabCounts.set(tabId, next);
    setBadge(tabId, next);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tabCounts.delete(tabId);
});
