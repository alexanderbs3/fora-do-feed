"use client";

import { useActionState } from "react";
import { unsubscribeAction } from "./actions";

const initialState = { success: false, message: "" };

export function UnsubscribeForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(unsubscribeAction, initialState);

  return (
    <form action={formAction} className="mt-8">
      <input type="hidden" name="token" value={token} />
      <button
        type="submit"
        disabled={isPending || state.success}
        className="bg-[#ff4d1d] px-5 py-3 font-[var(--font-display)] text-xs uppercase tracking-[0.2em] text-[#14110f] transition hover:bg-[#d8ff3e] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Cancelando..." : state.success ? "Cancelado" : "Cancelar inscrição"}
      </button>

      {state.message && (
        <p className={`mt-5 border px-4 py-3 text-sm ${state.success ? "border-[#d8ff3e] text-[#d8ff3e]" : "border-[#ff4d1d] text-[#ffb29d]"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
