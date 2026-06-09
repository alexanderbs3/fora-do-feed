import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listEditableRssSources } from "@/lib/rss-sources";
import { saveRssSourcesAction } from "./actions";

type RssSourcesPageProps = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function RssSourcesPage({ searchParams }: RssSourcesPageProps) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const [{ saved }, { sources, usingFallback }] = await Promise.all([searchParams, listEditableRssSources()]);

  return (
    <main className="min-h-screen bg-[#080b12] px-5 py-10 text-[#f1e7d0] sm:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <a className="text-sm text-[#d8ff3e] underline" href="/admin">Voltar ao admin</a>
            <h1 className="mt-5 font-[var(--font-display)] text-5xl tracking-[-0.06em]">Fontes RSS</h1>
          </div>
          <a className="text-sm text-[#d8ff3e] underline" href="/admin/cron-runs">Rodar curadoria</a>
        </div>

        {saved && <p className="mb-6 border border-[#d8ff3e]/35 bg-[#d8ff3e]/10 p-4 text-sm text-[#d8ff3e]">Fontes salvas.</p>}
        {usingFallback && (
          <div className="mb-6 border border-[#ffb29d]/35 bg-[#ffb29d]/10 p-4 text-sm leading-6 text-[#ffd6ca]">
            Usando a lista padrão do código. Para salvar alterações aqui, aplique o schema da tabela <code>rss_sources</code> no Supabase.
          </div>
        )}

        <form action={saveRssSourcesAction} className="space-y-4">
          <div className="overflow-x-auto border border-[#f1e7d0]/15">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead className="bg-[#f1e7d0]/10 text-xs uppercase tracking-[0.18em] text-[#f1e7d0]/55">
                <tr>
                  <th className="p-3">Ativa</th>
                  <th className="p-3">Nome</th>
                  <th className="p-3">URL</th>
                  <th className="p-3">Confiança</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source) => (
                  <tr key={source.url} className="border-t border-[#f1e7d0]/10 text-[#f1e7d0]/75">
                    <td className="p-3">
                      <input defaultChecked={source.enabled !== false} name="enabled" type="checkbox" value={source.url} />
                    </td>
                    <td className="p-3">
                      <input className="w-full border border-[#f1e7d0]/18 bg-[#f1e7d0]/8 px-3 py-2 text-[#fff7e8] outline-none" name="name" defaultValue={source.name} />
                    </td>
                    <td className="p-3">
                      <input className="w-full border border-[#f1e7d0]/18 bg-[#f1e7d0]/8 px-3 py-2 text-[#fff7e8] outline-none" name="url" defaultValue={source.url} />
                    </td>
                    <td className="p-3">
                      <input className="w-24 border border-[#f1e7d0]/18 bg-[#f1e7d0]/8 px-3 py-2 text-[#fff7e8] outline-none" min="1" max="10" name="trust" type="number" defaultValue={source.trust} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="bg-[#d8ff3e] px-5 py-4 font-[var(--font-display)] text-xs uppercase tracking-[0.2em] text-[#14110f]">
            Salvar fontes
          </button>
        </form>
      </section>
    </main>
  );
}
