import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { EditionStatus, listEditions } from "@/lib/editions";
import { approveEditionAction, buildDraftAction } from "./actions";

type EditionsPageProps = {
  searchParams: Promise<{ status?: EditionStatus }>;
};

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export default async function EditionsPage({ searchParams }: EditionsPageProps) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const { status } = await searchParams;
  const selectedStatus = ["draft", "approved", "sent"].includes(String(status)) ? status : undefined;
  const editions = await listEditions(selectedStatus);

  return (
    <main className="min-h-screen bg-[#080b12] px-5 py-10 text-[#f1e7d0] sm:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <a className="text-sm text-[#d8ff3e] underline" href="/admin">Voltar ao admin</a>
            <h1 className="mt-5 font-[var(--font-display)] text-5xl tracking-[-0.06em]">Edições</h1>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-[#d8ff3e]">
            <a className="underline" href="/admin/editions">Todas</a>
            <a className="underline" href="/admin/editions?status=draft">Drafts</a>
            <a className="underline" href="/admin/editions?status=approved">Aprovadas</a>
            <a className="underline" href="/admin/editions?status=sent">Enviadas</a>
            <form action={buildDraftAction}>
              <button className="underline" type="submit">Gerar rascunho</button>
            </form>
          </div>
        </div>

        <div className="overflow-x-auto border border-[#f1e7d0]/15">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-[#f1e7d0]/10 text-xs uppercase tracking-[0.18em] text-[#f1e7d0]/55">
              <tr>
                <th className="p-3">Título</th>
                <th className="p-3">Status</th>
                <th className="p-3">Itens</th>
                <th className="p-3">Criada</th>
                <th className="p-3">Aprovada</th>
                <th className="p-3">Enviada</th>
                <th className="p-3">Ação</th>
              </tr>
            </thead>
            <tbody>
              {editions.map((edition) => (
                <tr key={edition.id} className="border-t border-[#f1e7d0]/10 text-[#f1e7d0]/75">
                  <td className="p-3"><a className="text-[#d8ff3e] underline" href={`/admin/editions/${edition.id}`}>{edition.title}</a></td>
                  <td className="p-3">{edition.status}</td>
                  <td className="p-3">{edition.items.length}</td>
                  <td className="p-3">{formatDate(edition.createdAt)}</td>
                  <td className="p-3">{formatDate(edition.approvedAt)}</td>
                  <td className="p-3">{formatDate(edition.sentAt)}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <a className="text-[#d8ff3e] underline" href={`/admin/editions/${edition.id}`}>Revisar</a>
                      {edition.status === "draft" && (
                        <form action={approveEditionAction}>
                          <input type="hidden" name="id" value={edition.id} />
                          <button className="text-[#d8ff3e] underline" type="submit">Aprovar</button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
