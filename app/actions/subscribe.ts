"use server";

import { Resend } from "resend";
import { headers } from "next/headers";
import { z } from "zod";
import WelcomeEmail from "@/emails/WelcomeEmail";
import { markWelcomeEmailSent, upsertSubscriber } from "@/lib/subscribers";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { getUnsubscribeUrl } from "@/lib/urls";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL || "Newsletter Técnica <onboarding@resend.dev>";

const subscribeSchema = z.object({
  email: z
    .string()
    .min(1, "O e-mail é obrigatório.")
    .email("Por favor, insira um endereço de e-mail válido."),
  name: z
    .string()
    .min(2, "O nome deve conter pelo menos 2 caracteres.")
    .max(50, "O nome excedeu o limite de caracteres.")
    .optional()
    .or(z.literal("")),
});

export type FormState = {
  success: boolean;
  message: string;
};

async function getRequestIp() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");

  return forwardedFor?.split(",")[0]?.trim() || headerStore.get("x-real-ip") || "unknown";
}

function isResendConfigured() {
  return Boolean(resendApiKey && !resendApiKey.includes("123456789abcdefghijklmnopqrstuvwxyz"));
}

function getResendErrorMessage(error: unknown) {
  const rawMessage = error instanceof Error ? error.message : String((error as { message?: string })?.message || "");
  const serializedError = JSON.stringify(error);
  const message = `${rawMessage} ${serializedError}`.toLowerCase();

  if (message.includes("api key is invalid") || message.includes("invalid api key")) {
    return "A chave RESEND_API_KEY configurada no ambiente é inválida.";
  }

  if (
    message.includes("domain is not verified") ||
    message.includes("verify a domain") ||
    message.includes("domain not found") ||
    message.includes("domain_not_found")
  ) {
    return "O domínio/remetente ainda não foi verificado no Resend.";
  }

  if (message.includes("testing emails") || message.includes("only send") || message.includes("to your own email")) {
    return "No modo de teste do Resend, envie apenas para o e-mail cadastrado na sua conta ou verifique um domínio.";
  }

  if (message.includes("from") || message.includes("sender")) {
    return "O remetente RESEND_FROM_EMAIL não foi aceito pelo Resend. Use onboarding@resend.dev em teste ou um domínio verificado.";
  }

  return "O Resend recusou o envio. Verifique a chave, o remetente e o destinatário.";
}

export async function subscribeUser(_prevState: FormState, formData: FormData): Promise<FormState> {
  const honeypot = formData.get("website");
  if (honeypot) {
    return { success: true, message: "" };
  }

  const rawEmail = formData.get("email");
  const rawName = formData.get("name");
  const turnstileToken = String(formData.get("cf-turnstile-response") || "");
  const ip = await getRequestIp();

  const rateLimit = checkRateLimit(`subscribe:${ip}`, 5, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    return { success: false, message: "Muitas tentativas. Aguarde alguns minutos e tente novamente." };
  }

  const isHuman = await verifyTurnstile(turnstileToken, ip);
  if (!isHuman) {
    return { success: false, message: "Confirme que você não é um robô antes de continuar." };
  }

  const validatedFields = subscribeSchema.safeParse({
    email: rawEmail,
    name: rawName,
  });

  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.flatten().fieldErrors;
    const firstError = Object.values(errorMessages)[0]?.[0] || "Dados inválidos.";

    return { success: false, message: firstError };
  }

  const { email, name } = validatedFields.data;
  const parsedName = name && name.trim() !== "" ? name.trim() : "Dev";

  if (!isResendConfigured()) {
    return {
      success: false,
      message: "Configure uma RESEND_API_KEY real em .env.local e reinicie o servidor.",
    };
  }

  try {
    const subscriber = await upsertSubscriber({ email, name: parsedName });
    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: resendFromEmail,
      to: [email.toLowerCase().trim()],
      subject: "Inscrição Confirmada! 🚀",
      react: WelcomeEmail({ name: parsedName, unsubscribeUrl: getUnsubscribeUrl(subscriber.unsubscribeToken) }),
    });

    if (error) {
      console.error("Erro retornado pela API do Resend:", error);

      return { success: false, message: getResendErrorMessage(error) };
    }

    await markWelcomeEmailSent(email);

    return { success: true, message: "🎉 Sucesso! Verifique sua caixa de entrada para confirmar a inscrição." };
  } catch (err) {
    console.error("Falha crítica interna no servidor:", err);

    return { success: false, message: "Erro interno no servidor. Por favor, tente mais tarde." };
  }
}
