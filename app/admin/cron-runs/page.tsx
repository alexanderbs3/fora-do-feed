import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listCronRuns } from "@/lib/cron-runs";

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

  if (reason) {
    return reason;
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

export default async function CronRunsPage() {
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

  const runs = await listCronRuns(80);

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
