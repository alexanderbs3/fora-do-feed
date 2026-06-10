import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicEditionDescription, getPublishedEditionBySlug } from "@/lib/editions";

type ArchiveEditionPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

function formatDate(value?: string) {
  if (!value) {
    return "sem data";
  }

  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

export async function generateMetadata({ params }: ArchiveEditionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const edition = await getPublishedEditionBySlug(slug);

  if (!edition) {
    return { title: "Edição não encontrada" };
  }

  return {
    title: edition.title,
    description: getPublicEditionDescription(edition.intro),
    alternates: { canonical: `/arquivo/${edition.slug}` },
    openGraph: { url: `/arquivo/${edition.slug}` },
  };
}

export default async function ArchiveEditionPage({ params }: ArchiveEditionPageProps) {
  const { slug } = await params;
  const edition = await getPublishedEditionBySlug(slug);

  if (!edition) {
    notFound();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b12] px-5 py-10 text-[#f1e7d0] sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(241,231,208,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(241,231,208,0.08)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(circle_at_20%_10%,black,transparent_70%)]" />
      <div className="pointer-events-none absolute -right-24 top-16 h-80 w-80 rounded-full bg-[#d8ff3e]/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-0 h-80 w-80 rounded-full bg-[#ff4d1d]/22 blur-3xl" />

      <article className="relative mx-auto max-w-4xl">
        <nav className="mb-10 flex flex-wrap items-center justify-between gap-4 text-sm">
          <a className="text-[#d8ff3e] underline" href="/arquivo">
            Voltar para arquivo
          </a>
          <a className="text-[#f1e7d0]/50 underline hover:text-[#d8ff3e]" href="/">
            Assinar newsletter
          </a>
        </nav>

        <header className="border-b border-[#f1e7d0]/15 pb-10">
          <p className="font-[var(--font-display)] text-xs uppercase tracking-[0.24em] text-[#d8ff3e]">
            Edição enviada em {formatDate(edition.sentAt)}
          </p>
          <h1 className="mt-5 font-[var(--font-display)] text-5xl leading-[0.9] tracking-[-0.07em] text-[#f8f0dc] sm:text-7xl">
            {edition.title}
          </h1>
          <p className="mt-7 text-xl leading-9 text-[#f1e7d0]/75">{getPublicEditionDescription(edition.intro)}</p>
        </header>

        <ol className="mt-10 space-y-6">
          {edition.items.map((item, index) => (
            <li key={`${item.url}-${index}`} className="border border-[#f1e7d0]/15 bg-[#f1e7d0]/5 p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-[var(--font-display)] text-3xl leading-none text-[#d8ff3e]">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-xs uppercase tracking-[0.2em] text-[#f1e7d0]/45">{item.source}</span>
              </div>
              <h2 className="mt-5 font-[var(--font-display)] text-3xl leading-none tracking-[-0.05em] text-[#f8f0dc]">
                {item.title}
              </h2>
              <p className="mt-4 text-base leading-8 text-[#f1e7d0]/72">{item.summary}</p>
              <a className="mt-5 inline-block text-sm text-[#d8ff3e] underline" href={item.url} rel="noreferrer" target="_blank">
                Ler notícia original
              </a>
            </li>
          ))}
        </ol>
      </article>
    </main>
  );
}
