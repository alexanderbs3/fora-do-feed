import { UnsubscribeForm } from "./UnsubscribeForm";

type UnsubscribePageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const { token = "" } = await searchParams;

  return (
    <main className="min-h-screen bg-[#080b12] px-5 py-12 text-[#f1e7d0] sm:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-2xl flex-col justify-center">
        <span className="mb-6 w-fit border border-[#ff4d1d] px-3 py-1 font-[var(--font-display)] text-[10px] uppercase tracking-[0.24em] text-[#ffb29d]">
          Descadastro
        </span>
        <h1 className="font-[var(--font-display)] text-5xl leading-[0.9] tracking-[-0.06em] text-[#f8f0dc] sm:text-6xl">
          Sair da newsletter
        </h1>
        <p className="mt-7 text-lg leading-8 text-[#f1e7d0]/75">
          Ao cancelar, você deixa de receber os e-mails semanais sobre desenvolvimento e inteligência artificial.
        </p>
        {token ? <UnsubscribeForm token={token} /> : <p className="mt-8 border border-[#ff4d1d] px-4 py-3 text-[#ffb29d]">Link inválido: token ausente.</p>}
      </section>
    </main>
  );
}
