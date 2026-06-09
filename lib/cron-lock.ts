import { createSupabaseAdmin } from "@/lib/supabase";

export type CronLock = {
  name: string;
  owner: string;
  acquired: boolean;
  disabled: boolean;
};

function isMissingLockTable(error: { code?: string; message?: string }) {
  return error.code === "PGRST205" || error.code === "42P01" || Boolean(error.message?.includes("cron_locks"));
}

function getLockUntil(ttlMs: number) {
  return new Date(Date.now() + ttlMs).toISOString();
}

export async function acquireCronLock(name: string, ttlMs: number): Promise<CronLock> {
  const supabase = createSupabaseAdmin();
  const owner = crypto.randomUUID();
  const lockedUntil = getLockUntil(ttlMs);
  const now = new Date().toISOString();

  const { error: insertError } = await supabase.from("cron_locks").insert({
    name,
    owner,
    locked_until: lockedUntil,
    updated_at: now,
  });

  if (!insertError) {
    return { name, owner, acquired: true, disabled: false };
  }

  if (isMissingLockTable(insertError)) {
    return { name, owner, acquired: true, disabled: true };
  }

  if (insertError.code !== "23505") {
    throw new Error(`Erro ao adquirir trava do cron: ${insertError.message}`);
  }

  const { data, error: updateError } = await supabase
    .from("cron_locks")
    .update({ owner, locked_until: lockedUntil, updated_at: now })
    .eq("name", name)
    .lt("locked_until", now)
    .select("name")
    .maybeSingle();

  if (updateError) {
    if (isMissingLockTable(updateError)) {
      return { name, owner, acquired: true, disabled: true };
    }

    throw new Error(`Erro ao renovar trava do cron: ${updateError.message}`);
  }

  return { name, owner, acquired: Boolean(data), disabled: false };
}

export async function releaseCronLock(lock: CronLock) {
  if (!lock.acquired || lock.disabled) {
    return;
  }

  const supabase = createSupabaseAdmin();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("cron_locks")
    .update({ locked_until: now, updated_at: now })
    .eq("name", lock.name)
    .eq("owner", lock.owner);

  if (error && !isMissingLockTable(error)) {
    throw new Error(`Erro ao liberar trava do cron: ${error.message}`);
  }
}
