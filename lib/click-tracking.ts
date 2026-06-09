import { createSupabaseAdmin } from "@/lib/supabase";

function isMissingClicksTable(error: { code?: string; message?: string }) {
  return error.code === "PGRST205" || error.code === "42P01" || Boolean(error.message?.includes("newsletter_clicks"));
}

export async function recordNewsletterClick(input: {
  editionId: string;
  itemIndex: number;
  url: string;
  token?: string;
  userAgent?: string | null;
}) {
  const supabase = createSupabaseAdmin();
  let subscriberId: string | null = null;

  if (input.token) {
    const { data, error } = await supabase.from("subscribers").select("id").eq("unsubscribe_token", input.token).maybeSingle();
    if (!error && data?.id) {
      subscriberId = data.id as string;
    }
  }

  const { error } = await supabase.from("newsletter_clicks").insert({
    edition_id: input.editionId,
    subscriber_id: subscriberId,
    item_index: input.itemIndex,
    url: input.url,
    user_agent: input.userAgent || null,
  });

  if (error && !isMissingClicksTable(error)) {
    throw new Error(`Erro ao registrar clique: ${error.message}`);
  }
}

export async function getClickStatsByEdition(editionId: string) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from("newsletter_clicks").select("item_index,subscriber_id").eq("edition_id", editionId);

  if (error) {
    if (isMissingClicksTable(error)) {
      return { totalClicks: 0, uniqueClickers: 0, topItems: [] as Array<{ itemIndex: number; clicks: number }> };
    }

    throw new Error(`Erro ao carregar cliques da edição: ${error.message}`);
  }

  const rows = (data || []) as Array<{ item_index: number | null; subscriber_id: string | null }>;
  const uniqueClickers = new Set(rows.map((row) => row.subscriber_id).filter(Boolean)).size;
  const counts = new Map<number, number>();
  for (const row of rows) {
    if (typeof row.item_index === "number") {
      counts.set(row.item_index, (counts.get(row.item_index) || 0) + 1);
    }
  }

  return {
    totalClicks: rows.length,
    uniqueClickers,
    topItems: [...counts.entries()]
      .map(([itemIndex, clicks]) => ({ itemIndex, clicks }))
      .sort((a, b) => b.clicks - a.clicks),
  };
}
