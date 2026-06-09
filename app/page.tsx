import { SubscribeForm } from "./components/SubscribeForm";

const topics = ["código limpo", "produção real", "IA aplicada", "carreira dev"];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b12] px-5 py-6 text-[#f1e7d0] sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(241,231,208,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(241,231,208,0.08)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(circle_at_25%_20%,black,transparent_70%)]" />
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#ff4d1d]/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#d8ff3e]/15 blur-3xl" />

      <section className="relative mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative z-10 py-10">
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <span className="border border-[#d8ff3e] bg-[#d8ff3e] px-3 py-1 font-[var(--font-display)] text-[10px] uppercase tracking-[0.24em] text-[#14110f] shadow-[5px_5px_0_#ff4d1d]">
              Newsletter Técnica
            </span>
            <span className="text-xs uppercase tracking-[0.32em] text-[#f1e7d0]/60">dev + inteligência artificial</span>
          </div>

          <h1 className="max-w-4xl font-[var(--font-display)] text-5xl leading-[0.86] tracking-[-0.07em] text-[#f8f0dc] sm:text-7xl lg:text-8xl">
            Código bom não nasce no feed.
          </h1>

          <p className="mt-7 max-w-2xl text-xl leading-8 text-[#f1e7d0]/78 sm:text-2xl">
            Receba análises curtas e aplicáveis sobre código, carreira, produção e notícias de inteligência artificial
            explicadas para devs iniciantes e intermediários.
          </p>

          <div className="mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {topics.map((topic) => (
              <div
                key={topic}
                className="border border-[#f1e7d0]/18 bg-[#f1e7d0]/5 px-3 py-4 text-sm lowercase text-[#f1e7d0]/72 backdrop-blur"
              >
                {topic}
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-end gap-5">
            <div className="font-[var(--font-display)] text-6xl leading-none text-[#d8ff3e]">07</div>
            <p className="max-w-64 border-l border-[#f1e7d0]/25 pl-5 text-sm uppercase tracking-[0.2em] text-[#f1e7d0]/55">
              minutos de leitura para sair com uma decisão técnica melhor
            </p>
          </div>
        </div>

        <div className="relative z-10 lg:pl-8">
          <div className="absolute -right-4 -top-6 hidden h-24 w-24 border-r-2 border-t-2 border-[#d8ff3e] lg:block" />
          <SubscribeForm />
          <p className="mx-auto mt-5 max-w-md text-center text-xs uppercase tracking-[0.18em] text-[#f1e7d0]/45">
            Sem spam. Sem thread reciclada. Apenas engenharia praticável.
          </p>
          <p className="mx-auto mt-3 max-w-md text-center text-xs text-[#f1e7d0]/40">
            Ao se inscrever, você concorda com a nossa{" "}
            <a className="text-[#d8ff3e] underline" href="/politica-de-privacidade">
              política de privacidade
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
