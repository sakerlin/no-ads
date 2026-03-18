export const DEFAULT_AD_SELECTORS = [
  // generic ad containers
  '[id^="ad_"]',
  '[id^="ads_"]',
  '[id*="ad-banner"]',
  '[class*="ad-banner"]',
  '[class*="adslot"]',
  '[class*="ad-slot"]',
  '[class*="adsbygoogle"]',
  // common labels
  'iframe[src*="doubleclick.net"]',
  'iframe[src*="googlesyndication.com"]',
  // social/embed widgets often used as ads - keep conservative
  // 'aside[aria-label*="Sponsored"]',
  // sticky banners
  '[class*="sticky"][class*="ad"]',
  // Taiwanese portals sometimes
  '[id*="banner"][id*="ad"]',
];
