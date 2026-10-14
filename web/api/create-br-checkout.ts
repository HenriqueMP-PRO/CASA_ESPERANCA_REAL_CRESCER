import { randomUUID } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const ASAAS_API = {
  production: "https://api.asaas.com/v3",
  sandbox: "https://api-sandbox.asaas.com/v3",
} as const;

const ASAAS_CHECKOUT_HOSTS = {
  production: ["www.asaas.com", "asaas.com"],
  sandbox: ["sandbox.asaas.com"],
} as const;

// Hosted checkout: card/payer data is collected by Asaas, not this site.
// Receipt reconciliation is performed in the Asaas dashboard in this version.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, currency, frequency } = req.body ?? {};
  if (
    !Number.isSafeInteger(amount) || amount < 500 || amount > 100_000_000 ||
    currency !== "brl" || frequency !== "once"
  ) {
    return res.status(400).json({ error: "Invalid BRL donation" });
  }

  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey || process.env.VITE_BRAZIL_PAYMENTS_ENABLED !== "true") {
    return res.status(503).json({ error: "Brazilian payments are not configured" });
  }
  // Anything other than an explicit "production" stays in the sandbox.
  const environment = process.env.ASAAS_ENVIRONMENT === "production" ? "production" : "sandbox";

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
    const response = await fetch(`${ASAAS_API[environment]}/paymentLinks`, {
      method: "POST",
      headers: {
        access_token: apiKey,
        "Content-Type": "application/json",
        "User-Agent": "casa-esperanca-real-crescer-site",
      },
      signal: AbortSignal.timeout(15_000),
      body: JSON.stringify({
        name: "Doação — Casa Esperança Real Crescer",
        description: "Doação única para a Casa Esperança Real Crescer",
        value: amount / 100,
        billingType: "CREDIT_CARD",
        chargeType: "DETACHED",
        externalReference: `cerc-${randomUUID()}`,
        notificationEnabled: false,
        // Never infer payment approval from a browser redirect.
        callback: {
          successUrl: `${origin}/?donation=review`,
          autoRedirect: true,
        },
      }),
    });

    if (!response.ok) {
      console.error("Asaas payment link creation failed", response.status);
      return res.status(502).json({ error: "Could not create Brazilian checkout" });
    }
    const data = await response.json() as { url?: string };
    const checkoutUrl = new URL(data.url ?? "");
    if (
      checkoutUrl.protocol !== "https:" ||
      !(ASAAS_CHECKOUT_HOSTS[environment] as readonly string[]).includes(checkoutUrl.hostname) ||
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
