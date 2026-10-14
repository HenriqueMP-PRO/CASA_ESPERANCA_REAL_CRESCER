import { randomUUID } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Hosted checkout: financial/payer data is collected by Mercado Pago, not this site.
// Receipt reconciliation is performed in the provider dashboard in this version.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, currency, frequency, locale } = req.body ?? {};
  if (
    !Number.isSafeInteger(amount) || amount < 100 || amount > 100_000_000 ||
    currency !== "brl" || frequency !== "once"
  ) {
    return res.status(400).json({ error: "Invalid BRL donation" });
  }

  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token || process.env.VITE_BRAZIL_PAYMENTS_ENABLED !== "true") {
    return res.status(503).json({ error: "Brazilian payments are not configured" });
  }

  let origin: string;
  try {
    const siteUrl = new URL(process.env.SITE_URL ?? "");
    if (siteUrl.protocol !== "https:" || siteUrl.username || siteUrl.password) {
      throw new Error("Invalid site URL");
    }
    origin = siteUrl.origin;
  } catch {
    return res.status(503).json({ error: "Payment return URL is not configured" });
  }

  try {
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(15_000),
      body: JSON.stringify({
        items: [{
          id: "donation-cerc",
          title: "Doação — Casa Esperança Real Crescer",
          quantity: 1,
          currency_id: "BRL",
          unit_price: amount / 100,
        }],
        external_reference: `cerc-${randomUUID()}`,
        metadata: {
          donor_locale: ["pt", "en", "fr"].includes(locale) ? locale : "pt",
          purpose: "donation",
        },
        // Never infer payment approval from a browser redirect.
        back_urls: {
          success: `${origin}/?donation=review`,
          pending: `${origin}/?donation=review`,
          failure: `${origin}/?donation=canceled`,
        },
        auto_return: "approved",
        payment_methods: { installments: 1 },
      }),
    });

    if (!response.ok) {
      console.error("Mercado Pago preference creation failed", response.status);
      return res.status(502).json({ error: "Could not create Brazilian checkout" });
    }
    const data = await response.json() as { init_point?: string };
    const checkoutUrl = new URL(data.init_point ?? "");
    if (
      checkoutUrl.protocol !== "https:" ||
      checkoutUrl.hostname !== "www.mercadopago.com.br" ||
      checkoutUrl.username || checkoutUrl.password
    ) {
      throw new Error("Unexpected checkout URL");
    }
    return res.status(200).json({ url: checkoutUrl.href });
  } catch {
    console.error("Brazilian checkout request failed");
    return res.status(502).json({ error: "Could not create Brazilian checkout" });
  }
}
