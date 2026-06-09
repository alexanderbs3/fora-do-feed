import { getSubscriberStats, getSubscribers } from "@/lib/subscribers";

type AdminPageProps = {
  searchParams: Promise<{ secret?: string }>;
};

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { secret = "" } = await searchParams;
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret || secret !== adminSecret) {
    return (
      <main className="min-h-screen bg-[#080b12] px-5 py-12 text-[#f1e7d0]">
        <section className="mx-auto max-w-3xl">
          <h1 className="font-[var(--font-display)] text-5xl tracking-[-0.06em]">Admin bloqueado</h1>
          <p className="mt-5 text-[#f1e7d0]/70">Acesse com o parâmetro correto: /admin?secret=SEU_ADMIN_SECRET</p>
        </section>
      </main>
    );
  }

  const subscribers = await getSubscribers();
  const stats = getSubscriberStats(subscribers);
  const recentEvents = subscribers
    .flatMap((subscriber) => subscriber.events.map((event) => ({ ...event, email: subscriber.email })))
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 12);

  return (
    <main className="min-h-screen bg-[#080b12] px-5 py-10 text-[#f1e7d0] sm:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="bg-[#d8ff3e] px-3 py-1 font-[var(--font-display)] text-[10px] uppercase tracking-[0.24em] text-[#14110f]">
              Painel admin
            </span>
            <h1 className="mt-5 font-[var(--font-display)] text-5xl leading-none tracking-[-0.06em] text-[#f8f0dc]">
              Newsletter
            </h1>
          </div>
          <a className="text-sm text-[#d8ff3e] underline" href={`/email-preview/weekly/1?secret=${encodeURIComponent(secret)}`} target="_blank">
            Preview Semana 1
          </a>
        </div>

        <div className="grid gap-3 sm:grid-cols-5">
          {[
            ["Total", stats.total],
            ["Ativos", stats.active],
            ["Cancelados", stats.unsubscribed],
            ["Enviados", stats.sent],
            ["Falhas", stats.failed],
          ].map(([label, value]) => (
            <div key={label} className="border border-[#f1e7d0]/15 bg-[#f1e7d0]/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#f1e7d0]/50">{label}</p>
              <p className="mt-3 font-[var(--font-display)] text-3xl text-[#d8ff3e]">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 overflow-x-auto border border-[#f1e7d0]/15">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-[#f1e7d0]/10 text-xs uppercase tracking-[0.18em] text-[#f1e7d0]/55">
              <tr>
                <th className="p-3">E-mail</th>
                <th className="p-3">Nome</th>
                <th className="p-3">Status</th>
                <th className="p-3">Inscrição</th>
                <th className="p-3">Última semana</th>
                <th className="p-3">Último envio</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.email} className="border-t border-[#f1e7d0]/10 text-[#f1e7d0]/75">
                  <td className="p-3">{subscriber.email}</td>
                  <td className="p-3">{subscriber.name}</td>
                  <td className="p-3">{subscriber.status}</td>
                  <td className="p-3">{formatDate(subscriber.subscribedAt)}</td>
                  <td className="p-3">{subscriber.lastSentWeek}</td>
                  <td className="p-3">{formatDate(subscriber.lastSentAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 border border-[#f1e7d0]/15 bg-[#f1e7d0]/5 p-5">
          <h2 className="font-[var(--font-display)] text-xl tracking-[-0.04em] text-[#f8f0dc]">Eventos recentes</h2>
          <div className="mt-4 space-y-3">
            {recentEvents.map((event) => (
              <p key={`${event.email}-${event.type}-${event.at}`} className="text-sm text-[#f1e7d0]/70">
                {formatDate(event.at)} | {event.email} | {event.type}
                {event.week ? ` | semana ${event.week}` : ""}
                {event.message ? ` | ${event.message}` : ""}
              </p>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
