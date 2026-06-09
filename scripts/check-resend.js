const fs = require("node:fs");
const path = require("node:path");

const envPath = path.join(process.cwd(), ".env.local");

function loadEnv() {
  if (!fs.existsSync(envPath)) {
    throw new Error("Arquivo .env.local não encontrado.");
  }

  const env = {};
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    env[trimmed.slice(0, separator)] = trimmed.slice(separator + 1);
  }

  return env;
}

function getSenderAddress(from) {
  const match = from.match(/<([^>]+)>/);
  return (match ? match[1] : from).trim().replace(/^['"]|['"]$/g, "");
}

async function main() {
  const env = loadEnv();
  const apiKey = env.RESEND_API_KEY;
  const from = env.RESEND_FROM_EMAIL || "Newsletter Técnica <onboarding@resend.dev>";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY ausente no .env.local.");
  }

  if (!apiKey.startsWith("re_")) {
    throw new Error("RESEND_API_KEY não parece uma chave do Resend. Ela normalmente começa com re_.");
  }

  const response = await fetch("https://api.resend.com/domains", {
    headers: { authorization: `Bearer ${apiKey}` },
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`Resend recusou a chave: ${body?.message || response.statusText}`);
  }

  const domains = Array.isArray(body?.data) ? body.data : [];
  const senderAddress = getSenderAddress(from);
  const senderDomain = senderAddress.split("@")[1] || "";
  const verifiedDomains = domains.filter((domain) => domain.status === "verified").map((domain) => domain.name);

  console.log("RESEND_API_KEY: OK");
  console.log(`RESEND_FROM_EMAIL: ${from.replace(/<[^>]+>/, "<[hidden]>")}`);

  if (senderDomain === "resend.dev") {
    console.log("Modo teste: usando resend.dev. Envie apenas para o e-mail da conta ou verifique um domínio.");
    return;
  }

  if (verifiedDomains.includes(senderDomain)) {
    console.log(`Domínio verificado: ${senderDomain}`);
    return;
  }

  console.log(`Nenhum domínio verificado para o remetente: ${senderDomain}`);
  console.log("Verifique esse domínio no Resend ou use Newsletter Técnica <onboarding@resend.dev> temporariamente.");
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Falha no diagnóstico do Resend: ${error.message}`);
  process.exit(1);
});
