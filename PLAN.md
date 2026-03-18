# no-ads 開發計畫

目標：做一個簡單、可控、可擴充的 Chrome Extension 來「降低網頁廣告干擾」。

## 設計原則
- 先做「隱藏/移除廣告 DOM」：對使用者最直覺、開發成本低
- 網路封鎖（DNR）採保守策略：只封鎖少數明顯廣告網域，避免誤傷
- 可自訂：使用者可在 Options 加自己的 selector 規則

## 架構（Manifest V3）
- `manifest.json`
- `content-script.js`：
  - 預設廣告 selectors + 使用者自訂 selectors
  - MutationObserver 監聽 DOM 變化
  - throttle/去重避免過度耗電
- `options.html` + `options.js`：
  - 編輯自訂 selectors（多行）
  - 顯示目前預設規則（唯讀）
  - 一鍵還原
- `background.js`（service worker）：
  - 初始化/管理 declarativeNetRequest ruleset（可選）

## MVP（第一版）
- [x] 基本 content script 隱藏常見廣告 selector
- [x] Options 頁面可自訂 selectors（sync）
- [x] DNR ruleset（少量）
- [ ] Icon / 品牌視覺
- [ ] popup 顯示：目前頁面隱藏數量、暫停本網站

## 後續
- 白名單（對特定網域不動）
- per-site 設定（某站特別容易誤判）
- 匯入/匯出規則
