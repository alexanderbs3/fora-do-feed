export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-[#080b12] px-5 py-12 text-[#f1e7d0] sm:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-3xl flex-col justify-center">
        <span className="mb-6 w-fit bg-[#d8ff3e] px-3 py-1 font-[var(--font-display)] text-[10px] uppercase tracking-[0.24em] text-[#14110f] shadow-[5px_5px_0_#ff4d1d]">
          Inscrição confirmada
        </span>
        <h1 className="font-[var(--font-display)] text-5xl leading-[0.9] tracking-[-0.06em] text-[#f8f0dc] sm:text-7xl">
          Você está na lista.
        </h1>
        <p className="mt-7 max-w-2xl text-xl leading-8 text-[#f1e7d0]/75">
          O e-mail de boas-vindas já foi enviado. Amanhã você recebe a primeira edição com conteúdo técnico e uma seção
          sobre inteligência artificial.
        </p>
        <a
          href="/"
          className="mt-10 w-fit border border-[#d8ff3e] px-5 py-3 font-[var(--font-display)] text-xs uppercase tracking-[0.2em] text-[#d8ff3e] transition hover:bg-[#d8ff3e] hover:text-[#14110f]"
        >
          Voltar para o início
        </a>
      </section>
    </main>
  );
}
