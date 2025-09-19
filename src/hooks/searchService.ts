import type { FeedFinderResponse } from "@shared/types";

// Using a CORS proxy to fetch the URL content from the client-side.
const CORS_PROXY = "https://api.allorigins.win/raw?url=";

const COMMON_FEED_PATHS = [
  "/feed",
  "/rss",
  "/feed.xml",
  "/rss.xml",
  "/atom.xml",
  "/.rss",
  "/blog/feed",
];

/**
 * Parses HTML content to find a <link> tag for an RSS or Atom feed.
 * @param html The HTML content as a string.
 * @param baseUrl The base URL to resolve relative feed URLs.
 * @returns The absolute URL of the feed, or null if not found.
 */
const findFeedInHtml = (html: string, baseUrl: string): string | null => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const selectors = [
      'link[rel="alternate"][type="application/rss+xml"]',
      'link[rel="alternate"][type="application/atom+xml"]',
      'link[type="application/rss+xml"]',
      'link[type="application/atom+xml"]',
    ];

    for (const selector of selectors) {
      const link = doc.querySelector(selector);
      if (link) {
        const href = link.getAttribute("href");
        if (href) {
          return new URL(href, baseUrl).href;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error parsing HTML:", error);
    return null;
  }
};

/**
 * Tries to find a feed by checking common URL paths.
 * @param baseUrl The base URL of the website.
 * @returns The URL of a valid feed, or null if not found.
 */
const checkCommonFeedPaths = async (
  baseUrl: string
): Promise<string | null> => {
  for (const path of COMMON_FEED_PATHS) {
    const feedUrl = new URL(path, baseUrl).href;
    const fetchUrl = `${CORS_PROXY}${encodeURIComponent(feedUrl)}`;
    try {
      const response = await fetch(fetchUrl);
      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("xml") || contentType.includes("json")) {
          return feedUrl;
        }
      }
    } catch (error) {
      console.warn(`Could not check common path ${feedUrl}:`, error);
    }
  }
  return null;
};

export const findRssFeed = async (
  articleUrl: string,
  onProgress: (message: string) => void
): Promise<FeedFinderResponse> => {
  try {
    let pageUrl: URL;
    try {
      // Ensure the URL has a protocol, default to https if missing
      const urlWithProtocol =
        articleUrl.startsWith("http://") || articleUrl.startsWith("https://")
          ? articleUrl
          : `https://${articleUrl}`;
      pageUrl = new URL(urlWithProtocol);
    } catch (_) {
      return { feedUrl: null, error: "The provided URL is not valid." };
    }

    // Check the provided URL directly
    onProgress("Scanning the provided URL...");
    const fetchUrl = `${CORS_PROXY}${encodeURIComponent(pageUrl.href)}`;
    const response = await fetch(fetchUrl);

    if (response.ok) {
      const html = await response.text();
      const feedUrl = findFeedInHtml(html, pageUrl.href);
      if (feedUrl) {
        return { feedUrl, error: null };
      }
    } else {
      console.warn(
        `Failed to fetch initial URL with status: ${response.status}`
      );
    }

    // If it's not the homepage, check the homepage
    if (pageUrl.pathname !== "/" && pageUrl.pathname !== "") {
      onProgress("Scanning the homepage for a feed...");
      const homeUrl = pageUrl.origin;
      const fetchHomeUrl = `${CORS_PROXY}${encodeURIComponent(homeUrl)}`;
      try {
        const homeResponse = await fetch(fetchHomeUrl);
        if (homeResponse.ok) {
          const homeHtml = await homeResponse.text();
          const feedUrl = findFeedInHtml(homeHtml, homeUrl);
          if (feedUrl) {
            return { feedUrl, error: null };
          }
        }
      } catch (e) {
        console.warn("Could not fetch or parse homepage:", e);
      }
    }

    // Check for common feed paths
    onProgress("Checking for common feed paths...");
    const feedUrl = await checkCommonFeedPaths(pageUrl.origin);
    if (feedUrl) {
      return { feedUrl, error: null };
    }

    // If all fallbacks fail, this is a "not found" result, not an application error.
    return { feedUrl: null, error: null };
  } catch (error) {
    console.error("Error in findRssFeed:", error);
    return {
      feedUrl: null,
      error:
        "A network error occurred. Please check your connection or the browser console for more details.",
    };
  }
};
