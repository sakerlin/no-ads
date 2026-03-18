// MV3 service worker
// For now, we just ensure rulesets are enabled.

chrome.runtime.onInstalled.addListener(async () => {
  try {
    // Enable the default ruleset.
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: ['ruleset_1'],
      disableRulesetIds: [],
    });
  } catch (e) {
    // ignore
  }
});
