import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getEditionById } from "@/lib/editions";
import { approveEditionAction, saveDraftEditionAction, sendEditionTestAction } from "../actions";

type EditionPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; test?: string; error?: string }>;
};

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export default async function EditionPage({ params, searchParams }: EditionPageProps) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const { id } = await params;
  const { saved, test, error } = await searchParams;
  const edition = await getEditionById(id);
  if (!edition) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#080b12] px-5 py-10 text-[#f1e7d0] sm:px-8">
      <section className="mx-auto max-w-4xl">
        <a className="text-sm text-[#d8ff3e] underline" href="/admin/editions">Voltar para edições</a>
        <div className="mt-6 border border-[#f1e7d0]/15 bg-[#f1e7d0]/5 p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#f1e7d0]/50">{edition.status}</p>
              <h1 className="mt-3 font-[var(--font-display)] text-4xl tracking-[-0.05em]">{edition.title}</h1>
            </div>
            <a
              className="border border-[#d8ff3e] px-4 py-3 font-[var(--font-display)] text-xs uppercase tracking-[0.2em] text-[#d8ff3e]"
              href={`/admin/editions/${edition.id}/preview`}
              target="_blank"
            >
              Preview HTML
            </a>
          </div>

          {saved && <p className="mt-5 border border-[#d8ff3e]/40 bg-[#d8ff3e]/10 p-3 text-sm text-[#d8ff3e]">Alterações salvas.</p>}
          {test === "sent" && <p className="mt-5 border border-[#d8ff3e]/40 bg-[#d8ff3e]/10 p-3 text-sm text-[#d8ff3e]">E-mail de teste enviado.</p>}
          {error === "confirm" && <p className="mt-5 border border-[#ff4d1d]/50 bg-[#ff4d1d]/10 p-3 text-sm text-[#ffb29d]">Confirme a aprovação antes de continuar.</p>}

          <div className="mt-5 grid gap-3 text-sm text-[#f1e7d0]/65 sm:grid-cols-3">
            <p>Criada: {formatDate(edition.createdAt)}</p>
            <p>Aprovada: {formatDate(edition.approvedAt)}</p>
            <p>Enviada: {formatDate(edition.sentAt)}</p>
          </div>

          <div className="mt-8 grid gap-4 border border-[#f1e7d0]/12 bg-[#080b12]/40 p-5 sm:grid-cols-[1fr_auto]">
            <form action={sendEditionTestAction} className="flex flex-col gap-3 sm:flex-row">
              <input type="hidden" name="id" value={edition.id} />
              <input
                name="email"
                type="email"
                required
                className="min-w-0 flex-1 border border-[#f1e7d0]/18 bg-[#f1e7d0]/8 px-4 py-3 text-sm text-[#fff7e8] outline-none focus:border-[#d8ff3e]"
                placeholder="email@teste.com"
              />
              <button className="bg-[#f1e7d0] px-4 py-3 font-[var(--font-display)] text-xs uppercase tracking-[0.2em] text-[#14110f]">
                Enviar teste
              </button>
            </form>

            {edition.status === "draft" && (
              <form action={approveEditionAction} className="flex flex-col gap-3">
                <input type="hidden" name="id" value={edition.id} />
                <label className="flex items-center gap-2 text-xs text-[#f1e7d0]/65">
                  <input type="checkbox" name="confirm" value="yes" />
                  Revisei e aprovo o envio
                </label>
                <button className="bg-[#d8ff3e] px-4 py-3 font-[var(--font-display)] text-xs uppercase tracking-[0.2em] text-[#14110f]">
                  Aprovar edição
                </button>
              </form>
            )}
          </div>

          {edition.status === "draft" ? (
            <form action={saveDraftEditionAction} className="mt-8 space-y-6">
              <input type="hidden" name="id" value={edition.id} />
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-[#f1e7d0]/50">Título</label>
                <input
                  name="title"
                  defaultValue={edition.title}
                  required
                  className="w-full border border-[#f1e7d0]/18 bg-[#f1e7d0]/8 px-4 py-3 text-[#fff7e8] outline-none focus:border-[#d8ff3e]"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-[#f1e7d0]/50">Introdução</label>
                <textarea
                  name="intro"
                  defaultValue={edition.intro}
                  required
                  rows={4}
                  className="w-full border border-[#f1e7d0]/18 bg-[#f1e7d0]/8 px-4 py-3 text-[#fff7e8] outline-none focus:border-[#d8ff3e]"
                />
              </div>

              <div className="space-y-5">
                {edition.items.map((item, index) => (
                  <article key={item.url} className="border border-[#f1e7d0]/12 bg-[#080b12]/40 p-5">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#d8ff3e]">Item {index + 1}</p>
                      <label className="flex items-center gap-2 text-xs text-[#ffb29d]">
                        <input type="checkbox" name="removeItem" value={String(index)} />
                        Remover
                      </label>
                    </div>
                    <div className="grid gap-3">
                      <input name="itemTitle" defaultValue={item.title} required className="border border-[#f1e7d0]/18 bg-[#f1e7d0]/8 px-4 py-3 text-[#fff7e8] outline-none focus:border-[#d8ff3e]" />
                      <input name="itemUrl" defaultValue={item.url} required className="border border-[#f1e7d0]/18 bg-[#f1e7d0]/8 px-4 py-3 text-[#fff7e8] outline-none focus:border-[#d8ff3e]" />
                      <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                        <input name="itemSource" defaultValue={item.source} required className="border border-[#f1e7d0]/18 bg-[#f1e7d0]/8 px-4 py-3 text-[#fff7e8] outline-none focus:border-[#d8ff3e]" />
                        <input name="itemScore" type="number" defaultValue={item.score} required className="border border-[#f1e7d0]/18 bg-[#f1e7d0]/8 px-4 py-3 text-[#fff7e8] outline-none focus:border-[#d8ff3e]" />
                      </div>
                      <textarea name="itemSummary" defaultValue={item.summary} required rows={4} className="border border-[#f1e7d0]/18 bg-[#f1e7d0]/8 px-4 py-3 text-[#fff7e8] outline-none focus:border-[#d8ff3e]" />
                    </div>
                  </article>
                ))}
              </div>

              <button className="bg-[#d8ff3e] px-5 py-4 font-[var(--font-display)] text-xs uppercase tracking-[0.2em] text-[#14110f]">
                Salvar alterações
              </button>
            </form>
          ) : (
            <>
              <p className="mt-6 leading-7 text-[#f1e7d0]/75">{edition.intro}</p>

              <div className="mt-8 space-y-5">
                {edition.items.map((item) => (
                  <article key={item.url} className="border border-[#f1e7d0]/12 bg-[#080b12]/40 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#d8ff3e]">{item.source} | score {item.score}</p>
                    <h2 className="mt-3 text-xl font-semibold text-[#f8f0dc]">{item.title}</h2>
                    <p className="mt-3 leading-7 text-[#f1e7d0]/70">{item.summary}</p>
                    <a className="mt-4 inline-block text-sm text-[#d8ff3e] underline" href={item.url} target="_blank">
                      Ler fonte original
                    </a>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
