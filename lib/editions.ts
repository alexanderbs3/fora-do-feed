import { createSupabaseAdmin } from "@/lib/supabase";
import { fetchRecentNews, ScoredNewsItem } from "@/lib/rss";

export type EditionStatus = "draft" | "approved" | "sent";

export type NewsletterEditionItem = {
  title: string;
  url: string;
  source: string;
  summary: string;
  score: number;
};

export type NewsletterEdition = {
  id: string;
  title: string;
  slug: string;
  status: EditionStatus;
  intro: string;
  items: NewsletterEditionItem[];
  createdAt: string;
  approvedAt?: string;
  sentAt?: string;
};

type NewsletterEditionRow = {
  id: string;
  title: string;
  slug: string;
  status: EditionStatus;
  intro: string;
  items: NewsletterEditionItem[];
  created_at: string;
  approved_at: string | null;
  sent_at: string | null;
};

function mapEdition(row: NewsletterEditionRow): NewsletterEdition {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    intro: row.intro,
    items: row.items || [],
    createdAt: row.created_at,
    approvedAt: row.approved_at || undefined,
    sentAt: row.sent_at || undefined,
  };
}

function isMissingTableError(error: { code?: string; message?: string }) {
  return error.code === "PGRST205" || error.code === "42P01" || Boolean(error.message?.includes("newsletter_editions"));
}

function createSlug(date = new Date()) {
  return `edicao-${date.toISOString().slice(0, 10)}`;
}

export async function listEditions(status?: EditionStatus) {
  const supabase = createSupabaseAdmin();
  let query = supabase
    .from("newsletter_editions")
    .select("id,title,slug,status,intro,items,created_at,approved_at,sent_at")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    if (isMissingTableError(error)) {
      return [];
    }

    throw new Error(`Erro ao carregar edições: ${error.message}`);
  }

  return ((data || []) as NewsletterEditionRow[]).map(mapEdition);
}

export async function getEditionById(id: string) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("newsletter_editions")
    .select("id,title,slug,status,intro,items,created_at,approved_at,sent_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error)) {
      return null;
    }

    throw new Error(`Erro ao carregar edição: ${error.message}`);
  }

  return data ? mapEdition(data as NewsletterEditionRow) : null;
}

export async function getLatestApprovedEdition() {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("newsletter_editions")
    .select("id,title,slug,status,intro,items,created_at,approved_at,sent_at")
    .eq("status", "approved")
    .order("approved_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error)) {
      return null;
    }

    throw new Error(`Erro ao carregar edição aprovada: ${error.message}`);
  }

  return data ? mapEdition(data as NewsletterEditionRow) : null;
}

export async function approveEdition(id: string) {
  const supabase = createSupabaseAdmin();
  const approvedAt = new Date().toISOString();
  const { error } = await supabase.from("newsletter_editions").update({ status: "approved", approved_at: approvedAt }).eq("id", id).eq("status", "draft");

  if (error) {
    throw new Error(`Erro ao aprovar edição: ${error.message}`);
  }
}

export async function markEditionSent(id: string) {
  const supabase = createSupabaseAdmin();
  const sentAt = new Date().toISOString();
  const { error } = await supabase.from("newsletter_editions").update({ status: "sent", sent_at: sentAt }).eq("id", id).eq("status", "approved");

  if (error) {
    throw new Error(`Erro ao marcar edição como enviada: ${error.message}`);
  }
}

export async function buildWeeklyDraft() {
  const supabase = createSupabaseAdmin();
  const now = new Date();
  const slug = createSlug(now);
  const news = await fetchRecentNews(7);

  if (news.length === 0) {
    return { edition: null, collected: 0 };
  }

  const newsRows = news.map((item: ScoredNewsItem) => ({
    title: item.title,
    url: item.url,
    source: item.source,
    published_at: item.publishedAt,
    summary: item.summary,
    score: item.score,
  }));

  const { error: newsError } = await supabase.from("news_items").upsert(newsRows, { onConflict: "url", ignoreDuplicates: true });
  if (newsError) {
    throw new Error(`Erro ao salvar notícias: ${newsError.message}`);
  }

  const title = `Fora do Feed - ${now.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`;
  const intro = "Rascunho gerado automaticamente a partir de fontes RSS. Revise títulos, links e contexto antes de aprovar o envio.";
  const items = news.slice(0, 7).map((item) => ({
    title: item.title,
    url: item.url,
    source: item.source,
    summary: item.summary,
    score: item.score,
  }));

  const { data, error } = await supabase
    .from("newsletter_editions")
    .upsert({ title, slug, status: "draft", intro, items }, { onConflict: "slug" })
    .select("id,title,slug,status,intro,items,created_at,approved_at,sent_at")
    .single();

  if (error) {
    throw new Error(`Erro ao criar rascunho: ${error.message}`);
  }

  return { edition: mapEdition(data as NewsletterEditionRow), collected: news.length };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderEditionHtml(edition: NewsletterEdition, unsubscribeUrl: string) {
  const items = edition.items
    .map(
      (item) => `
        <li style="margin:0 0 24px;padding:0 0 20px;border-bottom:1px solid #e7dcc4;">
          <p style="margin:0 0 6px;color:#6b6256;font-size:12px;text-transform:uppercase;letter-spacing:1px;">${escapeHtml(item.source)}</p>
          <h2 style="margin:0 0 8px;font-size:20px;line-height:1.3;color:#161616;">${escapeHtml(item.title)}</h2>
          <p style="margin:0 0 10px;color:#333;line-height:1.6;">${escapeHtml(item.summary)}</p>
          <a href="${escapeHtml(item.url)}" style="color:#0b5fff;">Ler notícia original</a>
        </li>`
    )
    .join("");

  return `
    <main style="margin:0;padding:32px;background:#f8f0dc;font-family:Arial,sans-serif;color:#161616;">
      <section style="max-width:680px;margin:0 auto;background:#fffaf0;padding:32px;border:1px solid #e7dcc4;">
        <p style="margin:0 0 12px;color:#ff4d1d;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Fora do Feed</p>
        <h1 style="margin:0 0 16px;font-size:32px;line-height:1.1;">${escapeHtml(edition.title)}</h1>
        <p style="margin:0 0 28px;color:#333;line-height:1.7;">${escapeHtml(edition.intro)}</p>
        <ol style="margin:0;padding:0;list-style:none;">${items}</ol>
        <p style="margin:32px 0 0;color:#6b6256;font-size:12px;line-height:1.6;">
          Você recebeu este e-mail porque se inscreveu no Fora do Feed.
          <a href="${escapeHtml(unsubscribeUrl)}" style="color:#6b6256;">Cancelar inscrição</a>.
        </p>
      </section>
    </main>`;
}
