import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const ALLOWED_CURRENCIES = new Set(["brl", "usd", "eur", "gbp"]);
const STRIPE_LOCALES: Record<string, Stripe.Checkout.SessionCreateParams.Locale> = {
  pt: "pt-BR",
  en: "en",
  fr: "fr",
};

// Minimum charge amounts required by Stripe, in cents.
const MIN_AMOUNT: Record<string, number> = {
  brl: 300,
  usd: 100,
  eur: 100,
  gbp: 100,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("STRIPE_SECRET_KEY is not configured");
    return res.status(500).json({ error: "Payment is not configured" });
  }

  const { amount, currency, frequency, locale } = req.body ?? {};

  if (
    typeof amount !== "number" ||
    !Number.isInteger(amount) ||
    typeof currency !== "string" ||
    !ALLOWED_CURRENCIES.has(currency)
  ) {
    return res.status(400).json({ error: "Invalid amount or currency" });
  }

  if (amount < (MIN_AMOUNT[currency] ?? 100) || amount > 100_000_000) {
    return res.status(400).json({ error: "Amount out of range" });
  }

  const isMonthly = frequency === "monthly";
  const stripe = new Stripe(secretKey);

  const origin =
    process.env.SITE_URL ??
    (req.headers.origin as string | undefined) ??
    `https://${req.headers.host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: isMonthly ? "subscription" : "payment",
      locale: STRIPE_LOCALES[locale as string] ?? "auto",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: amount,
            product_data: {
              name: "Doação — Casa Esperança Real Crescer",
            },
            ...(isMonthly ? { recurring: { interval: "month" as const } } : {}),
          },
        },
      ],
      payment_method_types: ["card"],
      metadata: { donor_locale: (locale as string) ?? "pt" },
      ...(isMonthly
        ? { subscription_data: { metadata: { donor_locale: (locale as string) ?? "pt" } } }
        : {}),
      success_url: `${origin}/?donation=success`,
      cancel_url: `${origin}/?donation=canceled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe session creation failed", err);
    return res.status(500).json({ error: "Could not create checkout session" });
  }
}
