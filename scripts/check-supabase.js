const fs = require("node:fs");
const path = require("node:path");

const envPath = path.join(process.cwd(), ".env.local");
const requiredEnv = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];

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

async function checkTable(env, table) {
  const url = new URL(`/rest/v1/${table}`, env.NEXT_PUBLIC_SUPABASE_URL);
  url.searchParams.set("select", "id");
  url.searchParams.set("limit", "1");

  const response = await fetch(url, {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    },
  });

  const body = await response.text();
  let parsed = null;
  try {
    parsed = body ? JSON.parse(body) : null;
  } catch {
    parsed = null;
  }

  if (response.ok) {
    console.log(`${table}: OK`);
    return true;
  }

  const code = parsed?.code || response.status;
  const message = parsed?.message || body || response.statusText;
  const hint = parsed?.hint || "";
  console.log(`${table}: ERRO ${code} - ${message}`);

  if (code === "42P01") {
    console.log(`Tabela ausente. Execute supabase/schema.sql no SQL Editor do Supabase.`);
  }

  if (code === "42501") {
    if (hint.includes("service_role")) {
      console.log("Permissão negada para service_role. Execute os GRANTs de supabase/schema.sql no SQL Editor do Supabase.");
    } else {
      console.log("Permissão negada. SUPABASE_SERVICE_ROLE_KEY parece ser a chave anon/publishable, não a service_role/secret.");
    }
  }

  return false;
}

async function main() {
  const env = loadEnv();
  const missing = requiredEnv.filter((key) => !env[key]);

  if (missing.length > 0) {
    throw new Error(`Variáveis ausentes no .env.local: ${missing.join(", ")}`);
  }

  const results = [];
  results.push(await checkTable(env, "subscribers"));
  results.push(await checkTable(env, "subscriber_events"));
  results.push(await checkTable(env, "newsletter_editions"));
  results.push(await checkTable(env, "news_items"));

  if (results.every(Boolean)) {
    console.log("Supabase configurado corretamente para as tabelas da newsletter.");
    return;
  }

  process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Falha no diagnóstico do Supabase: ${error.message}`);
  process.exit(1);
});
