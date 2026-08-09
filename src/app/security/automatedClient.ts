/** Known crawlers, scanners, and automation libraries (UA substring match). */
const BOT_USER_AGENT =
  /googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|facebot|ia_archiver|twitterbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkshare|w3c_validator|whatsapp|telegrambot|applebot|petalbot|semrush|ahrefs|mj12bot|dotbot|rogerbot|screaming frog|sitebulb|scrapy|httpclient|python-requests|curl\/|wget\/|go-http-client|java\/|libwww|headlesschrome|phantomjs|selenium|webdriver|puppeteer|playwright|bytespider|gptbot|chatgpt-user|claudebot|anthropic-ai|ccbot|amazonbot|facebookexternalhit|meta-externalagent/i;

/**
 * Best-effort client-side bot / automation detection.
 * Not a security boundary — Firestore rules and Auth are authoritative.
 */
export function isLikelyAutomatedClient(): boolean {
  if (typeof window === "undefined") return false;

  const nav = navigator as Navigator & { webdriver?: boolean };

  if (nav.webdriver) return true;

  const ua = nav.userAgent ?? "";
  if (BOT_USER_AGENT.test(ua)) return true;

  return /HeadlessChrome/i.test(ua);
}
