import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { Resend } from "resend";

export const config = {
  api: { bodyParser: false },
};

const EMAILS: Record<string, { subject: string; body: (name: string, amount: string) => string }> = {
  pt: {
    subject: "Muito obrigado pela sua doação! 💚",
    body: (name, amount) => `
      <p>Olá${name ? `, ${name}` : ""}!</p>
      <p>Recebemos a sua doação de <strong>${amount}</strong> com imensa gratidão.</p>
      <p>Sua generosidade se transforma em cestas básicas, materiais de construção, acolhimento
      e esperança para famílias no Brasil e nas aldeias do Congo.</p>
      <p>Que Deus abençoe você e sua família!</p>
      <p>Com carinho,<br/><strong>Casa Esperança Real Crescer</strong><br/>
      Rua Piriá, 105 – Brás de Pina, Rio de Janeiro – RJ</p>`,
  },
  en: {
    subject: "Thank you so much for your donation! 💚",
    body: (name, amount) => `
      <p>Hello${name ? `, ${name}` : ""}!</p>
      <p>We received your donation of <strong>${amount}</strong> with immense gratitude.</p>
      <p>Your generosity becomes food baskets, building materials, shelter and hope
      for families in Brazil and in the villages of Congo.</p>
      <p>May God bless you and your family!</p>
      <p>With love,<br/><strong>Casa Esperança Real Crescer</strong><br/>
      Rua Piriá, 105 – Brás de Pina, Rio de Janeiro – RJ, Brazil</p>`,
  },
  fr: {
    subject: "Merci beaucoup pour votre don ! 💚",
    body: (name, amount) => `
      <p>Bonjour${name ? `, ${name}` : ""} !</p>
      <p>Nous avons reçu votre don de <strong>${amount}</strong> avec une immense gratitude.</p>
      <p>Votre générosité se transforme en paniers alimentaires, matériaux de construction,
      accueil et espoir pour des familles au Brésil et dans les villages du Congo.</p>
      <p>Que Dieu vous bénisse, vous et votre famille !</p>
      <p>Avec affection,<br/><strong>Casa Esperança Real Crescer</strong><br/>
      Rua Piriá, 105 – Brás de Pina, Rio de Janeiro – RJ, Brésil</p>`,
  },
};

const DEFAULT_REPLY_TO = "Casa Esperança Real Crescer <casaesperancarealcrescer@gmail.com>";

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    console.error("Stripe webhook env vars missing");
    return res.status(500).json({ error: "Webhook not configured" });
  }

  const stripe = new Stripe(secretKey);

  let event: Stripe.Event;
  try {
    const rawBody = await readRawBody(req);
    const signature = req.headers["stripe-signature"] as string;
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return res.status(400).json({ error: "Invalid signature" });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email;
    const name = session.customer_details?.name ?? "";
    const locale = session.metadata?.donor_locale ?? "pt";
    const template = EMAILS[locale] ?? EMAILS.pt;

    if (email && process.env.RESEND_API_KEY) {
      const amount = new Intl.NumberFormat(locale === "pt" ? "pt-BR" : locale, {
        style: "currency",
        currency: (session.currency ?? "brl").toUpperCase(),
      }).format((session.amount_total ?? 0) / 100);

      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from:
            process.env.EMAIL_FROM ??
            "Casa Esperança Real Crescer <onboarding@resend.dev>",
          replyTo: process.env.EMAIL_REPLY_TO ?? DEFAULT_REPLY_TO,
          to: email,
          subject: template.subject,
          html: template.body(name, amount),
        });
      } catch (err) {
        // Log but still return 200 so Stripe doesn't retry indefinitely
        console.error("Failed to send thank-you email", err);
      }
    }
  }

  return res.status(200).json({ received: true });
}
