"use client";

import { useActionState, useEffect } from "react";
import { FormState, subscribeUser } from "../actions/subscribe";

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const initialState: FormState = {
  success: false,
  message: "",
};

export function SubscribeForm() {
  const [state, formAction, isPending] = useActionState(subscribeUser, initialState);

  useEffect(() => {
    if (!state.success) {
      return;
    }

    const timeout = window.setTimeout(() => {
      window.location.href = "/obrigado";
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [state.success]);

  return (
    <div className="mx-auto w-full max-w-md border border-[#f1e7d0]/20 bg-[#f1e7d0]/10 p-4 shadow-[18px_18px_0_rgba(216,255,62,0.12)] backdrop-blur-xl sm:p-6">
      {turnstileSiteKey && <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />}
      <div className="border border-[#f1e7d0]/18 bg-[#080b12]/72 p-5 sm:p-7">
        <div className="mb-7 flex items-start justify-between gap-5">
          <div>
            <p className="mb-3 font-[var(--font-display)] text-[10px] uppercase tracking-[0.28em] text-[#d8ff3e]">
              Entrada restrita
            </p>
            <h2 className="font-[var(--font-display)] text-3xl leading-none tracking-[-0.05em] text-[#f8f0dc]">
              Entre na lista.
            </h2>
          </div>
          <div className="grid h-12 w-12 place-items-center border border-[#ff4d1d] text-[#ff4d1d]">↗</div>
        </div>

        <p className="mb-7 text-base leading-7 text-[#f1e7d0]/68">
          Uma curadoria para entender desenvolvimento, produção e inteligência artificial sem cair em hype vazio.
        </p>

        <form action={formAction} className="space-y-4">
          <input
            type="text"
            name="website"
            style={{ display: "none", position: "absolute", left: "-9999px" }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div>
            <label htmlFor="name" className="mb-2 block font-[var(--font-display)] text-[10px] uppercase tracking-[0.24em] text-[#f1e7d0]/58">
              Nome opcional
            </label>
            <input
              id="name"
              type="text"
              name="name"
              disabled={isPending}
              className="w-full border border-[#f1e7d0]/18 bg-[#f1e7d0]/8 px-4 py-3 text-base text-[#fff7e8] outline-none transition placeholder:text-[#f1e7d0]/35 focus:border-[#d8ff3e] focus:bg-[#f1e7d0]/12 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Ex: Alexander Costa"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block font-[var(--font-display)] text-[10px] uppercase tracking-[0.24em] text-[#f1e7d0]/58">
              E-mail <span className="text-[#ff4d1d]">*</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              disabled={isPending}
              className="w-full border border-[#f1e7d0]/18 bg-[#f1e7d0]/8 px-4 py-3 text-base text-[#fff7e8] outline-none transition placeholder:text-[#f1e7d0]/35 focus:border-[#d8ff3e] focus:bg-[#f1e7d0]/12 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="seu.email@provedor.com"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="group relative mt-2 w-full overflow-hidden bg-[#d8ff3e] px-5 py-4 font-[var(--font-display)] text-xs uppercase tracking-[0.22em] text-[#14110f] transition hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#ff4d1d] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#f1e7d0]/35 disabled:shadow-none"
          >
            <span className="relative z-10">{isPending ? "Processando..." : "Quero receber"}</span>
            <span className="absolute inset-y-0 left-0 w-0 bg-[#f8f0dc] transition-all duration-300 group-hover:w-full" />
          </button>

          {turnstileSiteKey && <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="dark" />}

          {state.message && (
            <div
              className={`mt-5 border px-4 py-3 text-sm leading-6 ${
                state.success
                  ? "border-[#d8ff3e]/55 bg-[#d8ff3e]/10 text-[#d8ff3e]"
                  : "border-[#ff4d1d]/55 bg-[#ff4d1d]/10 text-[#ffb29d]"
              }`}
            >
              {state.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
