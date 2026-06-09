import type { Metadata } from "next";
import { listPublishedEditions } from "@/lib/editions";

export const metadata: Metadata = {
  title: "Arquivo | Fora do Feed",
  description: "Leia as edições já enviadas da newsletter Fora do Feed.",
};

export const dynamic = "force-dynamic";

function formatDate(value?: string) {
  if (!value) {
    return "sem data";
  }

  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export default async function ArchivePage() {
  const editions = await listPublishedEditions();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b12] px-5 py-10 text-[#f1e7d0] sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(241,231,208,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(241,231,208,0.08)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(circle_at_35%_15%,black,transparent_72%)]" />
      <div className="pointer-events-none absolute -left-28 top-24 h-80 w-80 rounded-full bg-[#ff4d1d]/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#d8ff3e]/12 blur-3xl" />

      <section className="relative mx-auto max-w-6xl">
        <nav className="mb-12 flex flex-wrap items-center justify-between gap-4 text-sm">
          <a className="text-[#d8ff3e] underline" href="/">
            Voltar para início
          </a>
          <span className="font-[var(--font-display)] text-xs uppercase tracking-[0.24em] text-[#f1e7d0]/45">
            Edições enviadas
          </span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <span className="border border-[#d8ff3e] bg-[#d8ff3e] px-3 py-1 font-[var(--font-display)] text-[10px] uppercase tracking-[0.24em] text-[#14110f] shadow-[5px_5px_0_#ff4d1d]">
              Arquivo público
            </span>
            <h1 className="mt-7 font-[var(--font-display)] text-5xl leading-[0.88] tracking-[-0.07em] text-[#f8f0dc] sm:text-7xl">
              O que já saiu do feed.
            </h1>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-[#f1e7d0]/72 sm:text-xl">
            Um registro das edições enviadas, com os sinais que passaram pela curadoria humana antes de chegar na caixa de entrada.
          </p>
        </div>

        {editions.length === 0 ? (
          <div className="mt-14 border border-[#f1e7d0]/15 bg-[#f1e7d0]/5 p-8">
            <p className="text-lg text-[#f1e7d0]/75">Ainda não há edições publicadas no arquivo.</p>
          </div>
        ) : (
          <div className="mt-14 grid gap-4">
            {editions.map((edition, index) => (
              <a
                key={edition.id}
                className="group grid gap-5 border border-[#f1e7d0]/15 bg-[#f1e7d0]/5 p-5 transition hover:border-[#d8ff3e]/55 hover:bg-[#f1e7d0]/8 sm:grid-cols-[120px_1fr_auto] sm:items-center"
                href={`/arquivo/${edition.slug}`}
              >
                <div>
                  <div className="font-[var(--font-display)] text-4xl leading-none text-[#d8ff3e]">{String(index + 1).padStart(2, "0")}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.18em] text-[#f1e7d0]/45">{formatDate(edition.sentAt)}</div>
                </div>
                <div>
                  <h2 className="font-[var(--font-display)] text-3xl leading-none tracking-[-0.05em] text-[#f8f0dc] group-hover:text-[#d8ff3e]">
                    {edition.title}
                  </h2>
                  <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-6 text-[#f1e7d0]/65">{edition.intro}</p>
                </div>
                <div className="font-[var(--font-display)] text-xs uppercase tracking-[0.2em] text-[#ffb29d]">
                  {edition.items.length} sinais
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
