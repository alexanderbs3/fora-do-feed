"use server";

import { redirect } from "next/navigation";
import { clearAdminCookie, isValidAdminSecret, setAdminCookie } from "@/lib/admin-auth";

export async function loginAdmin(formData: FormData) {
  const secret = String(formData.get("secret") || "");

  if (!isValidAdminSecret(secret)) {
    redirect("/admin?error=1");
  }

  await setAdminCookie();
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminCookie();
  redirect("/admin");
}
