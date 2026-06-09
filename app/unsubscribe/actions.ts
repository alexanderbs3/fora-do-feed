"use server";

import { unsubscribeByToken } from "@/lib/subscribers";

type UnsubscribeState = {
  success: boolean;
  message: string;
};

export async function unsubscribeAction(_prevState: UnsubscribeState, formData: FormData): Promise<UnsubscribeState> {
  const token = String(formData.get("token") || "");

  if (!token) {
    return { success: false, message: "Token de descadastro ausente." };
  }

  const subscriber = await unsubscribeByToken(token);

  if (!subscriber) {
    return { success: false, message: "Link de descadastro inválido ou expirado." };
  }

  return { success: true, message: "Inscrição cancelada com sucesso." };
}
