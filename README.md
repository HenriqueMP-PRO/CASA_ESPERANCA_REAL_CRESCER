# Casa Esperança Real Crescer — Landing Page

Landing page responsiva e multilíngue (PT/EN/FR) com doações em BRL via Pix no Banco do Brasil e internacionais via Stripe,
e-mail de agradecimento via Resend. Conteúdo editado direto no código.

## Estrutura

```
web/      → Frontend React (Vite) + funções serverless em web/api/
imagens/  → Fotos originais (copiadas para web/public/images)
texts/    → Textos originais da ONG
```

### Fotos

Ao adicionar ou trocar fotos em `web/public/images`, rode `npm run images`
(dentro de `web/`). O script gera versões WebP em vários tamanhos e atualiza
`web/src/content/image-variants.json`, usado pelo site para servir a foto do
tamanho certo para cada tela.

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
| `VITE_BRAZIL_PAYMENTS_ENABLED` | `true` somente após validar o Asaas; padrão desativado |
| `ASAAS_API_KEY` | Chave de API do Asaas (Integrações → Chaves de API); só no servidor |
| `ASAAS_ENVIRONMENT` | `production` para cobranças reais; qualquer outro valor usa o sandbox |
| `STRIPE_SECRET_KEY` | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Passo "Webhook do Stripe" abaixo |
| `RESEND_API_KEY` | [resend.com/api-keys](https://resend.com/api-keys) |
| `EMAIL_FROM` | Remetente verificado no Resend (ex.: `ONG <contato@seudominio.org>`) |
| `EMAIL_REPLY_TO` | Opcional; padrão: `Casa Esperança Real Crescer <casaesperancarealcrescer@gmail.com>` |
| `SITE_URL` | URL pública do site (ex.: `https://www.casaesperancarealcrescer.org`) |

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
webhook ou e-mail automático. Não precisa de credenciais Stripe ou Asaas.

Sem `VITE_BB_PIX_KEY` nem `VITE_BB_ACCOUNT_CNPJ` (e com o Asaas desativado), quem
escolhe BRL vê um aviso de "em breve" com botão para o WhatsApp da ONG. Só com o
CNPJ, o site mostra agência/conta com botões de copiar para Pix por dados bancários.
Não se promete isenção de tarifa PJ do BB sem verificar o contrato da conta.

### Cartão brasileiro via Asaas — preparado, desativado

O endpoint `/api/create-br-checkout` cria um link de pagamento Asaas
(`POST /v3/paymentLinks`) para cartão de crédito, em BRL, doação única, valor
mínimo de R$ 5,00 (limite do Asaas). O dinheiro fica no saldo Asaas e é
transferido depois para a conta BB; não é crédito direto no BB a cada doação.

Para ativar:

1. Abrir e aprovar a conta da associação no Asaas (diretoria, estatuto e ata
   de eleição registrados; análise de alguns dias úteis).
2. Cadastrar o domínio do site em Configurações da conta → Informações. O Asaas
   só redireciona o doador de volta para URLs desse domínio.
3. Testar no sandbox: criar conta em sandbox.asaas.com, gerar a chave e
   configurar `ASAAS_API_KEY` (sem `ASAAS_ENVIRONMENT`), `SITE_URL` HTTPS e
   `VITE_BRAZIL_PAYMENTS_ENABLED=true` num deploy de preview.
4. Em produção, trocar a chave pela de produção, definir
   `ASAAS_ENVIRONMENT=production` e fazer redeploy. Nunca expor a chave em `VITE_`.

Sem habilitação, a opção cartão BRL fica oculta e o endpoint retorna 503. As
notificações do Asaas ao doador ficam desligadas (`notificationEnabled: false`)
para evitar tarifas de notificação. A conferência é manual, no painel Asaas: não
há webhook, e-mail Resend ou recorrência brasileiros nesta versão. O retorno ao
site agradece, mas não confirma o pagamento.

A moeda inicial segue o idioma do site (PT → BRL, FR → EUR, demais → USD); o
doador pode trocar. O provedor é escolhido pela moeda, não por IP ou cartão.
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

## Conteúdo

Textos traduzidos ficam em `web/src/i18n/{pt,en,fr}.json`. Fotos, números,
projetos e contatos ficam em `web/src/content/site.ts`.

## Idiomas

As traduções ficam em `web/src/i18n/{pt,en,fr}.json`. O idioma é detectado pelo
aparelho; só a escolha manual no menu fica salva (localStorage). O link aceita
`?lang=pt|en|fr`. Idiomas não suportados caem em inglês.

## Validação das alterações de pagamento

No diretório `web`, execute `npm run build`, `npm run lint` e `npm test`
(Node 22.23 ou compatível com remoção nativa de tipos TypeScript). O build
inclui a checagem das funções em `api/`. Os sete testes usam respostas simuladas
dos provedores, sem criar pagamentos, e cobrem separação de moedas, recorrência
internacional, configuração ausente, valores inválidos e falhas do checkout.
