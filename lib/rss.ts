export type RssSource = {
  name: string;
  url: string;
  trust: number;
};

export type ScoredNewsItem = {
  title: string;
  url: string;
  source: string;
  publishedAt: string | null;
  summary: string;
  score: number;
};

export const rssSources: RssSource[] = [
  { name: "TechCrunch", url: "https://techcrunch.com/feed/", trust: 8 },
  { name: "The Verge", url: "https://www.theverge.com/rss/index.xml", trust: 8 },
  { name: "Wired", url: "https://www.wired.com/feed/rss", trust: 8 },
  { name: "MIT Technology Review", url: "https://www.technologyreview.com/feed/", trust: 9 },
  { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", trust: 8 },
];

const relevanceTerms = [
  "ai",
  "artificial intelligence",
  "software",
  "developer",
  "programming",
  "security",
  "cloud",
  "open source",
  "startup",
  "data",
  "privacy",
  "machine learning",
];

const clickbaitTerms = ["shocking", "you won't believe", "unbelievable", "secret", "hack that", "mind-blowing"];

function decodeXml(value: string) {
  return value
    .replaceAll("<![CDATA[", "")
    .replaceAll("]]>", "")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .trim();
}

function stripHtml(value: string) {
  return decodeXml(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function readTag(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function readLink(block: string) {
  const atomLink = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i)?.[1];
  return decodeXml(atomLink || readTag(block, "link"));
}

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function scoreItem(input: { title: string; summary: string; publishedAt: string | null; source: RssSource }) {
  const text = `${input.title} ${input.summary}`.toLowerCase();
  const now = Date.now();
  const publishedAt = input.publishedAt ? new Date(input.publishedAt).getTime() : now;
  const ageDays = Math.max((now - publishedAt) / (24 * 60 * 60 * 1000), 0);
  const recency = Math.max(0, 7 - Math.floor(ageDays));
  const relevance = relevanceTerms.reduce((total, term) => total + (text.includes(term) ? 3 : 0), 0);
  const clickbaitPenalty = clickbaitTerms.some((term) => text.includes(term)) ? 6 : 0;

  return Math.max(0, input.source.trust + recency + relevance - clickbaitPenalty);
}

function parseItems(xml: string, source: RssSource) {
  const blocks = xml.match(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi) || [];

  return blocks
    .map((block): ScoredNewsItem | null => {
      const title = stripHtml(readTag(block, "title"));
      const url = readLink(block);
      const publishedAt = parseDate(readTag(block, "pubDate") || readTag(block, "published") || readTag(block, "updated"));
      const summary = stripHtml(readTag(block, "description") || readTag(block, "summary") || readTag(block, "content:encoded")).slice(0, 500);

      if (!title || !url) {
        return null;
      }

      return {
        title,
        url,
        source: source.name,
        publishedAt,
        summary,
        score: scoreItem({ title, summary, publishedAt, source }),
      };
    })
    .filter((item): item is ScoredNewsItem => Boolean(item));
}

export async function fetchRecentNews(days = 7) {
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  const results = await Promise.allSettled(
    rssSources.map(async (source) => {
      const response = await fetch(source.url, { next: { revalidate: 60 * 30 } });
      if (!response.ok) {
        throw new Error(`${source.name}: ${response.status}`);
      }

      return parseItems(await response.text(), source);
    })
  );

  const byUrl = new Map<string, ScoredNewsItem>();
  for (const result of results) {
    if (result.status !== "fulfilled") {
      continue;
    }

    for (const item of result.value) {
      const publishedAt = item.publishedAt ? new Date(item.publishedAt).getTime() : Date.now();
      if (publishedAt < since) {
        continue;
      }

      const existing = byUrl.get(item.url);
      if (!existing || item.score > existing.score) {
        byUrl.set(item.url, item);
      }
    }
  }

  return [...byUrl.values()].sort((a, b) => b.score - a.score).slice(0, 12);
}
