# Casa Esperança Real Crescer — Landing Page

Landing page responsiva e multilíngue (PT/EN/FR) com doações em BRL via Pix no Banco do Brasil e internacionais via Stripe,
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
| `VITE_BB_ACCOUNT_CNPJ` | CNPJ confirmado do titular para Pix manual por dados bancários |
| `VITE_BB_PIX_KEY` | Chave Pix confirmada da conta BB; vazia até confirmação |
| `VITE_BRAZIL_PAYMENTS_ENABLED` | `true` somente após validar Mercado Pago; padrão desativado |
| `MERCADO_PAGO_ACCESS_TOKEN` | Credencial secreta da aplicação Mercado Pago |
| `STRIPE_SECRET_KEY` | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Passo "Webhook do Stripe" abaixo |
| `RESEND_API_KEY` | [resend.com/api-keys](https://resend.com/api-keys) |
| `EMAIL_FROM` | Remetente verificado no Resend (ex.: `ONG <contato@seudominio.org>`) |
| `EMAIL_REPLY_TO` | Opcional; padrão: `Casa Esperança Real Crescer <casaesperancarealcrescer@gmail.com>` |
| `SITE_URL` | URL pública do site (ex.: `https://www.casaesperancarealcrescer.org`) |
| `VITE_SANITY_PROJECT_ID` | [sanity.io/manage](https://sanity.io/manage) (opcional) |
| `VITE_SANITY_DATASET` | normalmente `production` (opcional) |

5. Deploy. Aponte o domínio `casaesperancarealcrescer.org` para a Vercel
   (Settings → Domains).

## Configurando o Stripe

O Stripe atende exclusivamente USD, EUR e GBP, com doação única ou mensal.
A API rejeita BRL, inclusive quando chamada diretamente. O pacote `stripe`
continua necessário para os pagamentos internacionais e seus webhooks.

1. Use a conta Stripe da ONG, com o CNPJ confirmado da entidade, e complete a
   verificação. Há divergência de CNPJ no documento bancário fornecido; não use
   esse documento para alterar o cadastro sem confirmação.
2. Copie a chave secreta (`sk_live_...`) para `STRIPE_SECRET_KEY`.
3. **Webhook do e-mail de obrigado**: em
   [Developers → Webhooks](https://dashboard.stripe.com/webhooks), crie um endpoint:
   - URL: `https://SEU_DOMINIO/api/stripe-webhook`
   - Evento: `checkout.session.completed`
   - Copie o "Signing secret" (`whsec_...`) para `STRIPE_WEBHOOK_SECRET`.
Use as chaves de teste (`sk_test_...`) primeiro e faça uma doação com o cartão
de teste `4242 4242 4242 4242` para validar o fluxo completo.

## Configurando o Pix no Banco do Brasil

O Banco do Brasil é o banco indicado pela instituição: agência 3101-1, conta
corrente 3395-2, titular CASA DA ESPERANCA REAL CRESCER. A chave Pix anterior,
associada ao PagSeguro, foi retirada. PagBank está fora do escopo.

1. Confirme a chave Pix cadastrada nessa conta e configure `VITE_BB_PIX_KEY`.
   O PDF fornecido não contém chave Pix e seu CNPJ diverge do cadastro do site;
   não se presume que CNPJ, e-mail ou número da conta sejam uma chave válida.
2. Para Pix manual por dados bancários, confirmar e configurar
   `VITE_BB_ACCOUNT_CNPJ`. Agência/conta não são uma chave Pix.
3. Faça redeploy, pois as variáveis públicas são incorporadas no build.
4. Confira o QR Code no aplicativo bancário e valide banco/titular antes de
   disponibilizar o recebimento. Com a variável vazia, não há QR Code ou cópia.

O Pix é único e conferido manualmente no extrato; não há cobrança mensal,
webhook ou e-mail automático. Não precisa de credenciais Stripe ou Mercado Pago.
Não se promete isenção de tarifa PJ do BB sem verificar o contrato da conta.

### Cartão brasileiro opcional — preparado, desativado

O endpoint `/api/create-br-checkout` prepara um checkout Mercado Pago em BRL,
único e em uma parcela. O usuário aceitou intermediação e posterior repasse ao
BB; não é crédito direto nesta conta a cada doação. Ainda não foi ativado.

Se esse modelo for escolhido, verificar a conta da associação, criar aplicação
no Mercado Pago, configurar `MERCADO_PAGO_ACCESS_TOKEN` só no servidor,
`SITE_URL` HTTPS e `VITE_BRAZIL_PAYMENTS_ENABLED=true`, e fazer redeploy.
Validar primeiro com credenciais/contas de teste. Nunca expor o token em `VITE_`.
Sem habilitação, a opção cartão BRL fica oculta e o endpoint retorna 503.

A conferência desse checkout também é manual, no painel Mercado Pago. Não há
webhook, e-mail Resend ou recorrência brasileiros nesta versão. O retorno ao
site orienta consultar o provedor e não confirma pagamento.

A separação é por moeda selecionada, não IP/idioma/nacionalidade do cartão.
Assinaturas antigas em BRL no Stripe não são canceladas automaticamente.
Veja a [comparação de provedores e plano de setup](docs/pagamentos-brasil.md).

## Configurando o Resend (e-mail de obrigado)

1. Crie a conta em [resend.com](https://resend.com) (plano gratuito: 100 e-mails/dia).
2. Adicione e verifique o domínio da ONG (Domains → Add Domain, registros DNS).
3. Crie uma API key e preencha `RESEND_API_KEY` e `EMAIL_FROM`.
4. As respostas aos e-mails de agradecimento usam `EMAIL_REPLY_TO`; se a
   variável não estiver configurada, elas vão para
   `casaesperancarealcrescer@gmail.com`.

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

## Validação das alterações de pagamento

No diretório `web`, execute `npm run build`, `npm run lint` e `npm test`
(Node 22.23 ou compatível com remoção nativa de tipos TypeScript). O build
inclui a checagem das funções em `api/`. Os sete testes usam respostas simuladas
dos provedores, sem criar pagamentos, e cobrem separação de moedas, recorrência
internacional, configuração ausente, valores inválidos e falhas do checkout.
