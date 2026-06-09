"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { saveRssSources } from "@/lib/rss-sources";

function getStringList(formData: FormData, key: string) {
  return formData.getAll(key).map((value) => String(value || ""));
}

export async function saveRssSourcesAction(formData: FormData) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const names = getStringList(formData, "name");
  const urls = getStringList(formData, "url");
  const trusts = getStringList(formData, "trust");
  const enabledUrls = new Set(getStringList(formData, "enabled"));

  const sources = names
    .map((name, index) => ({
      name: name.trim(),
      url: (urls[index] || "").trim(),
      trust: Number(trusts[index] || 7),
      enabled: enabledUrls.has((urls[index] || "").trim()),
    }))
    .filter((source) => source.name && source.url);

  await saveRssSources(sources);
  revalidatePath("/admin/rss-sources");
  redirect("/admin/rss-sources?saved=1");
}
