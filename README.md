# Casa Esperança Real Crescer — Landing Page

Landing page responsiva e multilíngue (PT/EN/FR) com doações internacionais via Stripe,
e-mail de agradecimento via Resend e conteúdo editável via Sanity CMS.

## Estrutura

```
web/      → Frontend React (Vite) + funções serverless em web/api/
studio/   → Sanity Studio (painel de edição de conteúdo)
imagens/  → Fotos originais (copiadas para web/public/images)
texts/    → Textos originais da ONG
```

## Rodando localmente

```bash
cd web
npm install
npm run dev          # frontend em http://localhost:5173 (sem API de doação)
```

Para testar as doações localmente é preciso rodar via Vercel CLI (que serve as
funções de `api/`):

```bash
npm i -g vercel
cd web
cp .env.example .env   # preencha as chaves
vercel dev
```

## Deploy (Vercel — gratuito)

1. Suba este repositório para o GitHub.
2. Em [vercel.com](https://vercel.com), **Add New Project** → importe o repositório.
3. Em **Root Directory**, selecione `web`. O framework (Vite) é detectado automaticamente.
4. Configure as variáveis de ambiente (Settings → Environment Variables) conforme
   `web/.env.example`:

| Variável | Onde obter |
|---|---|
| `STRIPE_SECRET_KEY` | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Passo "Webhook do Stripe" abaixo |
| `RESEND_API_KEY` | [resend.com/api-keys](https://resend.com/api-keys) |
| `EMAIL_FROM` | Remetente verificado no Resend (ex.: `ONG <contato@seudominio.org>`) |
| `SITE_URL` | URL pública do site (ex.: `https://www.casaesperancarealcrescer.org`) |
| `VITE_SANITY_PROJECT_ID` | [sanity.io/manage](https://sanity.io/manage) (opcional) |
| `VITE_SANITY_DATASET` | normalmente `production` (opcional) |

5. Deploy. Aponte o domínio `casaesperancarealcrescer.org` para a Vercel
   (Settings → Domains).

## Configurando o Stripe

1. Crie a conta em [stripe.com](https://stripe.com) com o CNPJ da ONG
   (09.563.258/0001-70) e complete a verificação.
2. Copie a chave secreta (`sk_live_...`) para `STRIPE_SECRET_KEY`.
3. **Webhook do e-mail de obrigado**: em
   [Developers → Webhooks](https://dashboard.stripe.com/webhooks), crie um endpoint:
   - URL: `https://SEU_DOMINIO/api/stripe-webhook`
   - Evento: `checkout.session.completed`
   - Copie o "Signing secret" (`whsec_...`) para `STRIPE_WEBHOOK_SECRET`.
4. Para aceitar **Pix** (doações em BRL), ative-o em
   Settings → Payment methods.

Use as chaves de teste (`sk_test_...`) primeiro e faça uma doação com o cartão
de teste `4242 4242 4242 4242` para validar o fluxo completo.

## Configurando o Resend (e-mail de obrigado)

1. Crie a conta em [resend.com](https://resend.com) (plano gratuito: 100 e-mails/dia).
2. Adicione e verifique o domínio da ONG (Domains → Add Domain, registros DNS).
3. Crie uma API key e preencha `RESEND_API_KEY` e `EMAIL_FROM`.

Sem o Resend configurado, o doador ainda recebe o recibo padrão do Stripe
(ative em Stripe → Settings → Emails → "Successful payments").

## Configurando o Sanity (CMS — opcional)

O site funciona sem CMS usando o conteúdo local de `web/src/content/fallback.ts`.
Para permitir que pessoas não-técnicas editem projetos, fotos e contatos:

1. Crie um projeto gratuito em [sanity.io](https://www.sanity.io).
2. No `studio/`:
   ```bash
   cd studio
   npm install
   SANITY_STUDIO_PROJECT_ID=xxxx npm run dev     # painel local
   SANITY_STUDIO_PROJECT_ID=xxxx npm run deploy  # publica em xxxx.sanity.studio
   ```
3. Em [sanity.io/manage](https://sanity.io/manage) → API → CORS Origins, adicione
   o domínio do site.
4. Preencha `VITE_SANITY_PROJECT_ID` na Vercel e faça redeploy.
5. No Studio, crie os documentos "Configurações do Site", "Projeto" e
   "Imagem da Galeria". O que não for preenchido continua usando o conteúdo local.

## Idiomas

As traduções ficam em `web/src/i18n/{pt,en,fr}.json`. O idioma é detectado pelo
navegador e pode ser trocado no menu (persistido em localStorage).
