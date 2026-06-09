import { getActiveRssSources, type RssSource } from "@/lib/rss-sources";

export type { RssSource };

export type ScoredNewsItem = {
  title: string;
  url: string;
  source: string;
  publishedAt: string | null;
  summary: string;
  score: number;
};

const aiBusinessTerms = [
  "ai",
  "artificial intelligence",
  "agent",
  "agents",
  "automation",
  "chip",
  "chips",
  "funding",
  "ia",
  "inteligência artificial",
  "investimento",
  "investimentos",
  "model",
  "models",
  "modelo",
  "modelos",
  "negócio",
  "negócios",
  "openai",
  "rodada",
  "startup",
  "startups",
  "venture",
];

const developerTerms = [
  "software",
  "developer",
  "developers",
  "code",
  "coding",
  "programming",
  "api",
  "database",
  "desenvolvedor",
  "desenvolvedores",
  "infra",
  "infrastructure",
  "linux",
  "open source",
  "programação",
  "release",
  "segurança",
];

const technologyTerms = [
  "big tech",
  "browser",
  "dados",
  "governo",
  "internet",
  "lgpd",
  "cloud",
  "platform",
  "platforms",
  "plataforma",
  "plataformas",
  "privacy",
  "privacidade",
  "regulation",
  "regulação",
  "regulamentação",
  "security",
  "cybersecurity",
  "cibersegurança",
  "machine learning",
];

const clickbaitTerms = ["chocante", "inacreditável", "shocking", "você não vai acreditar", "you won't believe", "unbelievable", "secret", "hack that", "mind-blowing"];

function includesTerm(text: string, term: string) {
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escapedTerm}\\b`, "i").test(text);
}

function decodeXml(value: string) {
  return value
    .replaceAll("<![CDATA[", "")
    .replaceAll("]]>", "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
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
  const aiBusinessScore = aiBusinessTerms.reduce((total, term) => total + (includesTerm(text, term) ? 4 : 0), 0);
  const developerScore = developerTerms.reduce((total, term) => total + (includesTerm(text, term) ? 3 : 0), 0);
  const technologyScore = technologyTerms.reduce((total, term) => total + (includesTerm(text, term) ? 2 : 0), 0);
  const relevance = aiBusinessScore + developerScore + technologyScore;
  const clickbaitPenalty = clickbaitTerms.some((term) => includesTerm(text, term)) ? 6 : 0;

  if (relevance === 0) {
    return 0;
  }

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
  const rssSources = await getActiveRssSources();
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

      if (item.score <= 0) {
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
