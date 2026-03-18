// MV3 service worker
// - enable DNR ruleset
// - maintain per-tab hidden count and show it as toolbar badge

const tabCounts = new Map();

function setBadge(tabId, count) {
  const text = count > 0 ? String(count) : '';
  chrome.action.setBadgeText({ tabId, text });
  if (count > 0) {
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#e11d48' });
  }
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
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  const tabId = sender?.tab?.id;
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
