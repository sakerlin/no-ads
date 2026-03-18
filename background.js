// MV3 service worker
// - enable DNR ruleset
// - maintain per-tab hidden count and show it as toolbar badge

const tabCounts = new Map();

function getTabState(tabId) {
  if (!tabCounts.has(tabId)) tabCounts.set(tabId, { hidden: 0, blocked: 0 });
  return tabCounts.get(tabId);
}

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

function setBadge(tabId) {
  const st = getTabState(tabId);
  const total = (st.hidden || 0) + (st.blocked || 0);
  const text = String(total);
  console.log('[no-ads] setBadge', { tabId, hidden: st.hidden, blocked: st.blocked, total, text });
  safeActionCall(() => chrome.action.setBadgeText({ tabId, text }));
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

function bumpHidden(tabId, delta) {
  const st = getTabState(tabId);
  st.hidden = (st.hidden || 0) + Math.max(0, delta);
  setBadge(tabId);
}

const MATCHED_RULES_MIN_INTERVAL_MS = 5000;
const lastMatchedFetchAt = new Map();
const pendingTimers = new Map();

function scheduleRefreshBlockedCount(tabId, delayMs = 0) {
  if (pendingTimers.has(tabId)) return;
  const t = setTimeout(() => {
    pendingTimers.delete(tabId);
    refreshBlockedCount(tabId);
  }, delayMs);
  pendingTimers.set(tabId, t);
}

async function refreshBlockedCount(tabId) {
  try {
    if (!chrome.declarativeNetRequest?.getMatchedRules) return;

    const now = Date.now();
    const last = lastMatchedFetchAt.get(tabId) || 0;
    const wait = MATCHED_RULES_MIN_INTERVAL_MS - (now - last);
    if (wait > 0) {
      scheduleRefreshBlockedCount(tabId, wait);
      return;
    }

    lastMatchedFetchAt.set(tabId, now);

    const res = await chrome.declarativeNetRequest.getMatchedRules({ tabId });
    const matched = res?.rulesMatchedInfo?.length || 0;
    const st = getTabState(tabId);
    st.blocked = matched;
    setBadge(tabId);
  } catch (e) {
    console.log('[no-ads] getMatchedRules failed', e);
  }
}

chrome.runtime.onMessage.addListener((msg, sender) => {
  const tabId = sender?.tab?.id;
  console.log('[no-ads] onMessage', { msg, tabId, url: sender?.tab?.url });
  if (tabId == null) return;
  getTabState(tabId);

  if (msg?.type === 'resetCount') {
    tabCounts.set(tabId, { hidden: 0, blocked: 0 });
    setBadge(tabId);
    // refresh blocked count shortly after navigation
    scheduleRefreshBlockedCount(tabId, 500);
    return;
  }

  if (msg?.type === 'hiddenDelta') {
    const delta = Number(msg.delta) || 0;
    bumpHidden(tabId, delta);
  }
});

// Count network-level blocks via DNR feedback (requires declarativeNetRequestFeedback)
if (chrome.declarativeNetRequest?.onRuleMatchedDebug) {
  chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
    try {
      const tabId = info?.tabId;
      if (tabId == null || tabId < 0) return;
      console.log('[no-ads] onRuleMatchedDebug', info);
      // instead of +1 blindly, refresh matched rule count (more accurate)
      scheduleRefreshBlockedCount(tabId, 0);
    } catch {
      // ignore
    }
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    scheduleRefreshBlockedCount(tabId, 0);
  }
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  scheduleRefreshBlockedCount(tabId, 0);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tabCounts.delete(tabId);
});
