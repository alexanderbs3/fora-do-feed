export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#080b12] px-5 py-12 text-[#f1e7d0] sm:px-8">
      <section className="mx-auto max-w-3xl">
        <a className="text-sm text-[#d8ff3e] underline" href="/">
          Voltar
        </a>
        <h1 className="mt-8 font-[var(--font-display)] text-5xl leading-none tracking-[-0.06em] text-[#f8f0dc]">
          Política de Privacidade
        </h1>
        <div className="mt-8 space-y-6 text-base leading-8 text-[#f1e7d0]/75">
          <p>
            O Fora do Feed coleta apenas os dados necessários para operar a newsletter: nome opcional, e-mail, data de inscrição,
            status da inscrição e histórico técnico de envios.
          </p>
          <p>
            Usamos esses dados para enviar e-mails, controlar descadastros, evitar envios duplicados e manter registros mínimos de
            funcionamento do serviço.
          </p>
          <p>
            O envio de e-mails é processado pelo Resend e os dados de inscrição são armazenados no Supabase. Não vendemos,
            alugamos ou compartilhamos sua lista de e-mails para publicidade de terceiros.
          </p>
          <p>
            Você pode cancelar sua inscrição a qualquer momento pelo link de descadastro presente nos e-mails. Após o cancelamento,
            seu status é marcado como descadastrado para impedir novos envios.
          </p>
          <p>
            Para solicitar remoção ou correção de dados, responda qualquer e-mail recebido pela newsletter ou entre em contato pelo
            canal informado no domínio oficial.
          </p>
          <p className="text-sm text-[#f1e7d0]/50">Última atualização: junho de 2026.</p>
        </div>
      </section>
    </main>
  );
}
