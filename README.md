# Fora do Feed

Newsletter técnica com curadoria de tecnologia, software, IA e negócios tech. O projeto inclui landing page, inscrição com proteção anti-bot, envio via Resend, persistência no Supabase, área admin, arquivo público de edições, crons de curadoria/envio e métricas operacionais.

## Stack

- Next.js 16 com App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase como banco e backend operacional
- Resend para envio de e-mails
- Cloudflare Turnstile para validação anti-bot
- Vercel para deploy e crons

## Funcionalidades

- Landing page pública para captação de inscritos.
- Formulário de inscrição com validação, rate limit e Turnstile.
- E-mail de boas-vindas via Resend.
- Descadastro por token.
- Painel admin protegido por segredo.
- Curadoria de notícias via RSS.
- Geração de rascunho semanal.
- Revisão, edição e aprovação manual de edições.
- Envio semanal automatizado para inscritos ativos.
- Arquivo público de edições enviadas.
- Tracking de cliques em links da newsletter.
- Histórico de crons, travas de execução e métricas de envio.

## Requisitos

- Node.js 20.x
- npm
- Projeto Supabase configurado
- Conta Resend com API key
- Projeto Vercel para produção

## Instalação

```bash
npm install
```

## Variáveis De Ambiente

Crie um arquivo `.env.local` na raiz do projeto.

```env
NEXT_PUBLIC_APP_URL=https://fora-do-feed.com

NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

RESEND_API_KEY=re_sua_chave
RESEND_FROM_EMAIL=Fora do Feed <newsletter@seudominio.com>

ADMIN_SECRET=um-segredo-forte
CRON_SECRET=outro-segredo-forte

NEXT_PUBLIC_TURNSTILE_SITE_KEY=sua-site-key
TURNSTILE_SECRET_KEY=sua-secret-key
```

Notas:

- `SUPABASE_SERVICE_ROLE_KEY` deve ser a chave `service_role`, não a chave pública `anon`.
- `NEXT_PUBLIC_APP_URL` deve preferencialmente incluir protocolo, por exemplo `https://fora-do-feed.com`.
- `RESEND_FROM_EMAIL` precisa usar um domínio verificado no Resend em produção.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` e `TURNSTILE_SECRET_KEY` são opcionais para renderização, mas necessários para inscrições reais protegidas.

## Banco De Dados

O schema fica em:

```txt
supabase/schema.sql
```

Execute esse arquivo no SQL Editor do Supabase. Ele cria as tabelas:

- `subscribers`
- `subscriber_events`
- `newsletter_editions`
- `news_items`
- `cron_locks`
- `cron_runs`
- `rss_sources`
- `newsletter_clicks`

Depois de aplicar o schema, valide a conexão:

```bash
npm run check:supabase
```

## Resend

Valide a API key e o domínio remetente com:

```bash
npm run check:resend
```

Em modo de teste, é possível usar `Newsletter Técnica <onboarding@resend.dev>`, mas o Resend restringe os destinatários. Para produção, configure um domínio verificado.

## Scripts

```bash
npm run dev
```

Inicia o servidor de desenvolvimento.

```bash
npm run build
```

Gera o build de produção.

```bash
npm run start
```

Inicia o servidor de produção após o build.

```bash
npm run lint
```

Executa a checagem TypeScript sem emitir arquivos.

```bash
npm run check:supabase
```

Valida variáveis e tabelas do Supabase.

```bash
npm run check:resend
```

Valida chave e domínio do Resend.

## Rotas Principais

- `/`: landing page e inscrição.
- `/obrigado`: confirmação pós-inscrição.
- `/unsubscribe`: descadastro por token.
- `/politica-de-privacidade`: política de privacidade.
- `/arquivo`: arquivo público de edições enviadas.
- `/arquivo/[slug]`: edição pública.
- `/admin`: painel administrativo.
- `/admin/editions`: gerenciamento de edições.
- `/admin/cron-runs`: histórico e disparo manual dos crons.
- `/admin/rss-sources`: edição de fontes RSS.
- `/email-preview/welcome`: preview do e-mail de boas-vindas.
- `/email-preview/weekly/[week]`: preview de e-mail semanal.

## Fluxo Operacional

1. Usuário assina pela landing page.
2. A inscrição é salva no Supabase.
3. O e-mail de boas-vindas é enviado pelo Resend.
4. O cron `build-weekly` coleta notícias RSS e cria/atualiza um rascunho.
5. O admin revisa e aprova a edição.
6. O cron `send-weekly` envia a edição aprovada para inscritos ativos.
7. A edição enviada aparece no arquivo público.
8. Cliques, envios, falhas e descadastros alimentam as métricas administrativas.

## Crons Na Vercel

Os crons estão configurados em `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/build-weekly",
      "schedule": "0 11 * * 1"
    },
    {
      "path": "/api/cron/send-weekly",
      "schedule": "0 12 * * *"
    }
  ]
}
```

- `build-weekly`: roda segunda-feira às 11:00 UTC.
- `send-weekly`: roda diariamente às 12:00 UTC e só envia quando existir edição aprovada.

As rotas de cron usam `CRON_SECRET` para permitir disparo seguro pelo painel admin.

## Deploy

O projeto está preparado para Vercel.

Pontos importantes:

- O `package.json` fixa `node` em `20.x` via `engines`.
- As dependências principais estão fixadas para evitar quebra por `latest`.
- Configure todas as variáveis de ambiente no ambiente `Production` da Vercel.
- Após mudanças em variáveis, faça novo deploy.

## Diagnóstico De Build

Se o build falhar na Vercel:

1. Abra o deploy com erro.
2. Veja `Build Logs`, não `Runtime Logs`.
3. Procure a primeira stack trace antes de `Command "npm run build" exited with 1`.
4. Reproduza localmente com `npm run build`.

Erros comuns:

- `Invalid URL`: confira `NEXT_PUBLIC_APP_URL`.
- Erro de Supabase: confira `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `supabase/schema.sql`.
- Erro de Resend: valide com `npm run check:resend`.

## Segurança

- Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no cliente.
- Mantenha `ADMIN_SECRET` e `CRON_SECRET` fortes e diferentes.
- Use domínio verificado no Resend para produção.
- Revise permissões e RLS no Supabase antes de expor novas rotas.

## Estrutura

```txt
app/                 Rotas, páginas, actions e APIs Next.js
emails/              Templates de e-mail
lib/                 Regras de negócio e integrações
scripts/             Diagnósticos locais
supabase/schema.sql  Schema do banco
vercel.json          Crons da Vercel
```

## Manutenção

- Rode `npm run build` antes de fazer deploy relevante.
- Rode `npm run check:supabase` após mudanças no schema.
- Rode `npm run check:resend` após mudar remetente ou domínio.
- Evite voltar dependências para `latest` sem testar o build.
