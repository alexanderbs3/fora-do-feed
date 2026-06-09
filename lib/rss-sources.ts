import { createSupabaseAdmin } from "@/lib/supabase";

export type RssSource = {
  name: string;
  url: string;
  trust: number;
  enabled?: boolean;
};

export const defaultRssSources: RssSource[] = [
  { name: "Tecnoblog", url: "https://tecnoblog.net/feed/", trust: 8, enabled: true },
  { name: "Canaltech", url: "https://canaltech.com.br/rss/", trust: 7, enabled: true },
  { name: "Olhar Digital", url: "https://olhardigital.com.br/feed/", trust: 7, enabled: true },
  { name: "Manual do Usuario", url: "https://manualdousuario.net/feed/", trust: 8, enabled: true },
  { name: "Nucleo", url: "https://nucleo.jor.br/rss/", trust: 8, enabled: true },
  { name: "Brazil Journal", url: "https://braziljournal.com/feed/", trust: 7, enabled: true },
  { name: "TechCrunch", url: "https://techcrunch.com/feed/", trust: 8, enabled: true },
  { name: "The Verge", url: "https://www.theverge.com/rss/index.xml", trust: 8, enabled: true },
  { name: "Wired", url: "https://www.wired.com/feed/rss", trust: 8, enabled: true },
  { name: "MIT Technology Review", url: "https://www.technologyreview.com/feed/", trust: 9, enabled: true },
  { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", trust: 8, enabled: true },
  { name: "GitHub Blog", url: "https://github.blog/feed/", trust: 8, enabled: true },
  { name: "Cloudflare Blog", url: "https://blog.cloudflare.com/rss/", trust: 8, enabled: true },
  { name: "Google Security Blog", url: "https://security.googleblog.com/feeds/posts/default", trust: 8, enabled: true },
  { name: "Hacker News", url: "https://hnrss.org/frontpage", trust: 7, enabled: true },
];

type RssSourceRow = {
  name: string;
  url: string;
  trust: number | null;
  enabled: boolean | null;
};

function isMissingSourcesTable(error: { code?: string; message?: string }) {
  return error.code === "PGRST205" || error.code === "42P01" || Boolean(error.message?.includes("rss_sources"));
}

function mapSource(row: RssSourceRow): RssSource {
  return {
    name: row.name,
    url: row.url,
    trust: row.trust || 7,
    enabled: row.enabled !== false,
  };
}

export async function listEditableRssSources() {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from("rss_sources").select("name,url,trust,enabled").order("name", { ascending: true });

  if (error) {
    if (isMissingSourcesTable(error)) {
      return { sources: defaultRssSources, usingFallback: true };
    }

    throw new Error(`Erro ao carregar fontes RSS: ${error.message}`);
  }

  const sources = ((data || []) as RssSourceRow[]).map(mapSource);
  return { sources: sources.length > 0 ? sources : defaultRssSources, usingFallback: sources.length === 0 };
}

export async function getActiveRssSources() {
  const { sources } = await listEditableRssSources();
  return sources.filter((source) => source.enabled !== false);
}

export async function saveRssSources(sources: RssSource[]) {
  const supabase = createSupabaseAdmin();
  const rows = sources.map((source) => ({
    name: source.name.trim(),
    url: source.url.trim(),
    trust: Math.max(1, Math.min(10, Math.round(source.trust || 7))),
    enabled: source.enabled !== false,
  }));

  const { error } = await supabase.from("rss_sources").upsert(rows, { onConflict: "url" });

  if (error) {
    if (isMissingSourcesTable(error)) {
      throw new Error("Crie a tabela rss_sources usando supabase/schema.sql antes de salvar fontes pelo admin.");
    }

    throw new Error(`Erro ao salvar fontes RSS: ${error.message}`);
  }
}
