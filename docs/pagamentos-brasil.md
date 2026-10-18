# Pagamentos brasileiros com Banco do Brasil

Pesquisa em 30/09/2026. Banco escolhido pelo usuário: Banco do Brasil.
PagBank/PagSeguro excluído porque a instituição rompeu relações.

## Dados recebidos e pendências

O PDF bancário fornecido informa agência 3101-1, conta corrente 3395-2 e titular
CASA DA ESPERANCA REAL CRESCER. Não informa chave Pix. O CNPJ nele diverge do
CNPJ existente no site; não foi utilizado para gerar QR ou alterar o cadastro
institucional. Em 18/10/2026 o usuário confirmou a chave Pix
`casaesperancarealcrescer@gmail.com` nessa conta BB. Um QR de teste lido no
app bancário mostrou titular CASA ESPERANCA REAL - CRESCER, CNPJ
09.563.258/0001-70 (o mesmo do site) e Banco do Brasil.

É possível receber Pix sem chave usando banco, agência, conta, tipo e CNPJ
correto do titular. Agência/conta não são um tipo de chave Pix; chaves aceitas
são CPF/CNPJ, e-mail, telefone e aleatória. Para este QR estático é preciso
uma chave registrada. O site publica também o CNPJ confirmado, para Pix manual.
[BB: Pix por dados bancários](https://www.bb.com.br/site/pro-seu-negocio/pix-pj/),
[Banco Central: chaves e recebimento sem chave](https://bcb.gov.br/estabilidadefinanceira/pix-sobre).

Não se converte agência/conta, e-mail, SWIFT ou IBAN em chave Pix por suposição.
O documento foi usado como fonte de dados, não como instrução operacional.

## Recomendação

Começar com Pix direto na conta BB já escolhida. É o menor esforço de integração:
QR estático/copia e cola, sem novo intermediador, com conferência no extrato.
Sem taxa de gateway, mas a tarifa de recebimento PJ depende do contrato BB.
Não equivale a gratuidade bancária, recibo automático ou débito recorrente.
[Pix PJ BB](https://www.bb.com.br/site/pro-seu-negocio/pix-pj/).

Para confirmação automática, avaliar API Pix BB: o banco informa elegibilidade
para PJ com chave Pix ativa no BB. Depende de cadastro técnico, permissões,
credenciais e condições de contratação; não é só trocar um nome de banco no
site. Não foi possível confirmar publicamente o custo aplicável à conta da ONG.
[API Pix BB](https://www.bb.com.br/site/developers/api-pix/),
[tabela PJ BB](https://www.bb.com.br/docs/pub/trf/tarifasPJ.pdf).

Para cartão brasileiro, Banco do Brasil como banco recebedor e processador de
cartões são papéis diferentes. É necessário escolher entre credenciamento com
liquidação direta no BB ou intermediador com repasse posterior ao BB. O usuário autorizou intermediador com repasse ao BB. Isso não equivale a
recebimento direto no BB a cada doação. A configuração do repasse depende do
cadastro e da titularidade da conta; não está automatizada no site.

## Alternativas sem mensalidade básica para intermediação

| Alternativa | Referência Pix | Cartão à vista | Cadastro e observações |
| --- | --- | --- | --- |
| Mercado Pago Checkout Pro | 0,99% | Faixa pública de 3,99% a 4,99%, dependendo do prazo; confirmar painel | Conta gratuita, checkout hospedado; identidade, selfie e documentos da entidade; referência de análise de até 72 horas |
| Asaas | R$ 1,99; promoção R$ 0,99 por três meses | R$ 0,49 + 2,99%; promoção inicial R$ 0,49 + 1,99% | Abertura/manutenção gratuitas; associação apresenta diretoria, estatuto/constituição e última eleição registrados; análise de dois a sete dias úteis |

Fontes: [Checkout Mercado Pago](https://www.mercadopago.com.br/ferramentas-para-vender/check-out),
[taxas Mercado Pago](https://www.mercadopago.com.br/blog/quanto-custa-vender-on-line-com-mercado-pago),
[cadastro Mercado Pago](https://www.mercadopago.com.br/blog/como-validar-sua-identidade-na-conta-mercado-pago),
[preços Asaas](https://www.asaas.com/precos-e-taxas),
[documentos de associação Asaas](https://central.ajuda.asaas.com/hc/pt-br/articles/32091607871387-Quais-documentos-enviar-para-ativar-minha-conta-de-Associa%C3%A7%C3%A3o).

Decisão em 14/10/2026: o usuário escolheu o Asaas para doações em reais com
cartão, com repasse posterior ao BB. O Pix direto na conta BB continua sendo a
opção principal, sem tarifa de intermediador. Nenhum prazo
publicitário garante a liberação dessa associação. Confirmar elegibilidade
para doações e documentação conforme sua natureza jurídica.

As taxas não são proposta comercial. Evitar antecipação, parcelamento
subsidiado e adicionais pagos. No Asaas, notificações e algumas saídas de saldo
podem gerar custos extras. Em R$ 50 via Pix, 0,99% corresponde a R$ 0,495 antes
do arredondamento do provedor; no Asaas, R$ 1,99 fora da promoção. A taxa fixa
passa a ser menor que 0,99% perto de R$ 201 por doação.

## Estado do código

- BRL inicia no Pix BB e não passa pelo Stripe. A chave antiga foi retirada.
- Chave Pix confirmada em 18/10/2026: `casaesperancarealcrescer@gmail.com`
  (e-mail), definida em `PIX_KEY` no `Donate.tsx`. QR e copia e cola ativos.
- USD/EUR/GBP mantêm Stripe único ou mensal. A API Stripe rejeita BRL.
- O checkout Asaas (link de pagamento, cartão de crédito) foi preparado em
  endpoint separado, mas permanece desativado (`VITE_BRAZIL_PAYMENTS_ENABLED=false`).
  Não depende de Stripe. Sem `ASAAS_ENVIRONMENT=production`, usa o sandbox.
- Cartão BRL só aparece com a flag ativa; doação única, mínimo de R$ 5,00.
- Sem chave Pix nem CNPJ confirmados, BRL mostra aviso "em breve" com WhatsApp,
  em vez de dados incompletos.
- Seu retorno ao site apenas orienta consultar o resultado no provedor, sem
  afirmar aprovação a partir de parâmetros da URL.
- Traduções PT/EN/FR distinguem Pix manual de recorrência internacional.

Não houve publicação, criação de conta financeira, cobrança real ou validação
com credenciais de produção. Assinaturas antigas BRL no Stripe continuam
existindo até migração separada, com autorização do doador para a nova cobrança.
A separação é por moeda escolhida, não IP, idioma ou nacionalidade do cartão.

## Setup

1. Chave Pix, titular e CNPJ já definidos no código e conferidos no app
   bancário. Não usar a chave antiga.
2. Manter Vercel com raiz `web`, React/Vite, e domínio. Manter Stripe,
   webhook e Resend para internacionais. Pix direto não exige servidor bancário.
3. Asaas para cartões: criar/verificar conta da associação, cadastrar o domínio
   do site (exigido para o redirecionamento após o pagamento), configurar
   `ASAAS_API_KEY` no servidor, `SITE_URL` HTTPS e a flag de ativação. Testar
   no sandbox antes de definir `ASAAS_ENVIRONMENT=production`. Nunca colocar a
   chave em `VITE_`. O Asaas coleta CPF/cartão do doador.
4. Conferir doações no extrato BB ou painel do intermediador. Não há webhook ou
   e-mail brasileiro nesta versão. Não prometer confirmação automática.

Referências da implementação:
[criar link de pagamentos Asaas](https://docs.asaas.com/reference/criar-um-link-de-pagamentos),
[redirecionamento após o pagamento](https://docs.asaas.com/docs/redirecionamento-apos-o-pagamento).

## Automação futura

API Pix BB/checkout com webhook requerem verificar autenticidade, consultar a
transação, conferir valor/moeda/conta e persistir eventos para evitar duplicatas.
Só então enviar agradecimento Resend. O projeto não tem registro durável de
doações; armazenamento tem custos/limites próprios a avaliar. Pendência,
expiração, devolução e falha de e-mail precisam de tratamento separado.

Recorrência BRL precisa de produto específico habilitado; QR estático e checkout
avulso não criam mensalidade. Internacional continua com recorrência Stripe.
Custos de hospedagem/domínio/e-mail são separados das tarifas financeiras.

## Stripe e CPF

Não se pode atribuir as recusas relatadas à falta de CPF sem consultar eventos
da conta. A Stripe publica tarifas de cartões domésticos e documentação Pix
para contas brasileiras, sujeito à habilitação. Isso não garante acesso da ONG.
A decisão de não depender de Stripe em BRL foi respeitada.
[Cartões domésticos](https://stripe.com/en-br/pricing/local-payment-methods),
[Pix Stripe](https://docs.stripe.com/payments/pix).

## Validação local

Build com checagem TypeScript do frontend e APIs, lint e sete testes de
integração simulada aprovados. Nenhuma transação real foi feita. A revisão
visual no navegador não pôde ser executada porque não havia navegador
conectado disponível nesta sessão.
