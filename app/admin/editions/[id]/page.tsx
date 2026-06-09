import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getEditionById } from "@/lib/editions";
import { approveEditionAction } from "../actions";

type EditionPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export default async function EditionPage({ params }: EditionPageProps) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const { id } = await params;
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
            {edition.status === "draft" && (
              <form action={approveEditionAction}>
                <input type="hidden" name="id" value={edition.id} />
                <button className="bg-[#d8ff3e] px-4 py-3 font-[var(--font-display)] text-xs uppercase tracking-[0.2em] text-[#14110f]">
                  Aprovar edição
                </button>
              </form>
            )}
          </div>

          <div className="mt-5 grid gap-3 text-sm text-[#f1e7d0]/65 sm:grid-cols-3">
            <p>Criada: {formatDate(edition.createdAt)}</p>
            <p>Aprovada: {formatDate(edition.approvedAt)}</p>
            <p>Enviada: {formatDate(edition.sentAt)}</p>
          </div>

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
        </div>
      </section>
    </main>
  );
}
