import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listCronRuns } from "@/lib/cron-runs";
import { getEditorialNextAction, getLatestEdition } from "@/lib/editions";
import { triggerBuildWeeklyAction, triggerSendWeeklyAction } from "./actions";

type CronRunsPageProps = {
  searchParams: Promise<{ trigger?: string; status?: string; message?: string }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}

function formatSummary(summary: Record<string, unknown>) {
  const reason = typeof summary.reason === "string" ? summary.reason : undefined;
  const checked = typeof summary.checked === "number" ? summary.checked : undefined;
  const sent = typeof summary.sent === "number" ? summary.sent : undefined;
  const failed = typeof summary.failed === "number" ? summary.failed : undefined;
  const collected = typeof summary.collected === "number" ? summary.collected : undefined;
  const errors = Array.isArray(summary.errors) ? summary.errors : [];

  if (reason) {
    return errors.length > 0 ? `${reason} | erros ${errors.length}` : reason;
  }

  if (typeof checked === "number") {
    return `checados ${checked}, enviados ${sent || 0}, falhas ${failed || 0}`;
  }

  if (typeof collected === "number") {
    return `coletadas ${collected}`;
  }

  return "-";
}

function statusClass(status: string) {
  if (status === "success") {
    return "text-[#d8ff3e]";
  }

  if (status === "error") {
    return "text-[#ffb29d]";
  }

  return "text-[#f1e7d0]/60";
}

export default async function CronRunsPage({ searchParams }: CronRunsPageProps) {
  const feedback = await searchParams;
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#080b12] px-5 py-12 text-[#f1e7d0]">
        <section className="mx-auto max-w-md border border-[#f1e7d0]/15 bg-[#f1e7d0]/5 p-6">
          <h1 className="font-[var(--font-display)] text-5xl tracking-[-0.06em]">Admin bloqueado</h1>
          <p className="mt-5 text-[#f1e7d0]/70">Entre pelo painel admin antes de ver o histórico de crons.</p>
          <a className="mt-6 inline-block bg-[#d8ff3e] px-4 py-3 font-[var(--font-display)] text-xs uppercase tracking-[0.2em] text-[#14110f]" href="/admin">
            Abrir admin
          </a>
        </section>
      </main>
    );
  }

  const [runs, latestEdition] = await Promise.all([listCronRuns(80), getLatestEdition()]);
  const nextAction = getEditorialNextAction(latestEdition);

  return (
    <main className="min-h-screen bg-[#080b12] px-5 py-10 text-[#f1e7d0] sm:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="bg-[#d8ff3e] px-3 py-1 font-[var(--font-display)] text-[10px] uppercase tracking-[0.24em] text-[#14110f]">
              Operação
            </span>
            <h1 className="mt-5 font-[var(--font-display)] text-5xl leading-none tracking-[-0.06em] text-[#f8f0dc]">
              Histórico de crons
            </h1>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-[#d8ff3e]">
            <a className="underline" href="/admin">Admin</a>
            <a className="underline" href="/admin/editions">Edições</a>
          </div>
        </div>

        <div className="mb-8 border border-[#d8ff3e]/25 bg-[#d8ff3e]/10 p-5">
          <p className="font-[var(--font-display)] text-xs uppercase tracking-[0.22em] text-[#d8ff3e]">Próxima ação</p>
          <h2 className="mt-3 font-[var(--font-display)] text-3xl tracking-[-0.05em] text-[#f8f0dc]">{nextAction.label}</h2>
          <p className="mt-2 max-w-3xl text-sm text-[#f1e7d0]/75">{nextAction.description}</p>
          <a className="mt-4 inline-block text-sm text-[#d8ff3e] underline" href={nextAction.href}>Abrir etapa</a>
        </div>

        {feedback.message && (
          <div className={`mb-6 border p-4 text-sm ${feedback.status === "error" ? "border-[#ffb29d]/35 bg-[#ffb29d]/10 text-[#ffd6ca]" : "border-[#d8ff3e]/35 bg-[#d8ff3e]/10 text-[#f3ffd1]"}`}>
            <span className="font-[var(--font-display)] text-xs uppercase tracking-[0.18em]">
              {feedback.trigger || "cron"}
            </span>
            <p className="mt-2">{feedback.message}</p>
          </div>
        )}

        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <form action={triggerBuildWeeklyAction} className="border border-[#f1e7d0]/15 bg-[#f1e7d0]/5 p-5">
            <h2 className="font-[var(--font-display)] text-2xl tracking-[-0.04em] text-[#f8f0dc]">Gerar rascunho</h2>
            <p className="mt-2 text-sm text-[#f1e7d0]/65">
              Executa o mesmo cron de segunda-feira e cria ou atualiza o draft se não houver edição aprovada ou enviada.
            </p>
            <button className="mt-5 bg-[#d8ff3e] px-4 py-3 font-[var(--font-display)] text-xs uppercase tracking-[0.2em] text-[#14110f]" type="submit">
              Rodar build-weekly
            </button>
          </form>

          <form action={triggerSendWeeklyAction} className="border border-[#f1e7d0]/15 bg-[#f1e7d0]/5 p-5">
            <h2 className="font-[var(--font-display)] text-2xl tracking-[-0.04em] text-[#f8f0dc]">Enviar aprovada</h2>
            <p className="mt-2 text-sm text-[#f1e7d0]/65">
              Executa o cron de envio. Só envia se existir edição aprovada; drafts nunca são disparados.
            </p>
            <label className="mt-4 flex gap-3 text-sm text-[#f1e7d0]/70">
              <input className="mt-1 accent-[#d8ff3e]" name="confirm" type="checkbox" value="yes" />
              Confirmo que quero executar o envio agora.
            </label>
            <button className="mt-5 border border-[#ffb29d]/45 px-4 py-3 font-[var(--font-display)] text-xs uppercase tracking-[0.2em] text-[#ffcabd]" type="submit">
              Rodar send-weekly
            </button>
          </form>
        </div>

        <div className="overflow-x-auto border border-[#f1e7d0]/15">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-[#f1e7d0]/10 text-xs uppercase tracking-[0.18em] text-[#f1e7d0]/55">
              <tr>
                <th className="p-3">Início</th>
                <th className="p-3">Cron</th>
                <th className="p-3">Status</th>
                <th className="p-3">Duração</th>
                <th className="p-3">Resumo</th>
                <th className="p-3">Request</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id} className="border-t border-[#f1e7d0]/10 text-[#f1e7d0]/75">
                  <td className="p-3 whitespace-nowrap">{formatDate(run.startedAt)}</td>
                  <td className="p-3 font-mono text-xs text-[#f8f0dc]">{run.name}</td>
                  <td className={`p-3 font-[var(--font-display)] text-xs uppercase tracking-[0.18em] ${statusClass(run.status)}`}>
                    {run.status}
                  </td>
                  <td className="p-3">{run.durationMs}ms</td>
                  <td className="p-3">{formatSummary(run.summary)}</td>
                  <td className="p-3 font-mono text-xs text-[#f1e7d0]/50">{run.requestId || "-"}</td>
                </tr>
              ))}
              {runs.length === 0 && (
                <tr className="border-t border-[#f1e7d0]/10 text-[#f1e7d0]/60">
                  <td className="p-3" colSpan={6}>Nenhuma execução registrada ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
