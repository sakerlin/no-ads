# no-ads (Chrome Extension)

一個簡單的「阻擋/隱藏網頁廣告」Chrome Extension（Manifest V3）。

## 功能（MVP）
- 內容腳本（content script）用常見 CSS selector 自動隱藏疑似廣告區塊
- MutationObserver：頁面動態載入的廣告也會被持續處理
- Options 頁面：可自訂額外要隱藏的 selectors（儲存在 chrome.storage.sync）
- （可選）declarativeNetRequest：封鎖部分常見廣告網域 request（較保守的規則集）

## 開發/安裝（Load unpacked）
1. Chrome → `chrome://extensions`
2. 開啟「開發人員模式」
3. 點「載入未封裝項目」
4. 選取這個資料夾：`/home/saker/develop/no-ads`

## 注意
- 這不是 uBlock Origin 的替代品（uBO 更完整、更成熟）。
- 本專案偏向「輕量」：先從隱藏常見廣告區塊與少量網域封鎖開始。
- 某些網站可能會偵測/反制，或把重要內容誤判成廣告（可在 Options 調整）。
