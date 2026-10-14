import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import Stripe from "stripe";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import brazilCheckout from "../api/create-br-checkout.ts";
import stripeCheckout from "../api/create-checkout-session.ts";

const originalEnv = { ...process.env };
const originalFetch = globalThis.fetch;
const sessionsPrototype = Object.getPrototypeOf(new Stripe("sk_test_fixture").checkout.sessions);
const originalCreate = sessionsPrototype.create;

afterEach(() => {
  process.env = { ...originalEnv };
  globalThis.fetch = originalFetch;
  sessionsPrototype.create = originalCreate;
});

async function call(handler: typeof brazilCheckout, body: unknown, method = "POST") {
  const result = { status: 200, body: {} as Record<string, unknown> };
  const res = {
    setHeader() {},
    status(code: number) { result.status = code; return this; },
    json(value: Record<string, unknown>) { result.body = value; return this; },
  } as unknown as VercelResponse;
  await handler({ method, body, headers: {} } as VercelRequest, res);
  return result;
}

const donation = { amount: 5000, currency: "brl", frequency: "once", locale: "pt" };
function configureBrazil() {
  process.env.ASAAS_API_KEY = "fixture-token";
  process.env.ASAAS_ENVIRONMENT = "production";
  process.env.VITE_BRAZIL_PAYMENTS_ENABLED = "true";
  process.env.SITE_URL = "https://example.org";
}

test("Stripe rejects BRL before credentials or provider calls", async () => {
  delete process.env.STRIPE_SECRET_KEY;
  sessionsPrototype.create = () => { throw new Error("Stripe must not be called"); };
  assert.equal((await call(stripeCheckout, donation)).status, 400);
});

test("international one-time and monthly donations still create Stripe sessions", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_fixture";
  process.env.SITE_URL = "https://example.org";
  for (const currency of ["usd", "eur", "gbp"]) {
    for (const frequency of ["once", "monthly"]) {
      let session: Stripe.Checkout.SessionCreateParams | undefined;
      sessionsPrototype.create = async (params: Stripe.Checkout.SessionCreateParams) => {
        session = params;
        return { url: "https://checkout.stripe.com/fixture" };
      };
      assert.equal((await call(stripeCheckout, { ...donation, currency, frequency })).status, 200);
      assert.equal(session?.mode, frequency === "monthly" ? "subscription" : "payment");
      assert.equal(session?.line_items?.[0].price_data?.currency, currency);
    }
  }
});

test("Brazilian checkout stays unavailable without flag or credentials", async () => {
  configureBrazil();
  delete process.env.ASAAS_API_KEY;
  assert.equal((await call(brazilCheckout, donation)).status, 503);
  configureBrazil();
  process.env.VITE_BRAZIL_PAYMENTS_ENABLED = "false";
  assert.equal((await call(brazilCheckout, donation)).status, 503);
});

test("Brazilian checkout rejects other currencies, recurrence and invalid amounts", async () => {
  configureBrazil();
  for (const body of [
    { ...donation, currency: "usd" }, { ...donation, frequency: "monthly" },
    ...[0, -1, 99, 499, 100.5, 100_000_001, "5000", null].map(amount => ({ ...donation, amount })),
  ]) assert.equal((await call(brazilCheckout, body)).status, 400);
  assert.equal((await call(brazilCheckout, donation, "GET")).status, 405);
});

test("Asaas receives BRL cents correctly without any Stripe credentials", async () => {
  configureBrazil();
  delete process.env.STRIPE_SECRET_KEY;
  let sent: Record<string, any> | undefined;
  let headers: Record<string, string> | undefined;
  globalThis.fetch = (async (url, init) => {
    assert.equal(url, "https://api.asaas.com/v3/paymentLinks");
    sent = JSON.parse(init?.body as string);
    headers = init?.headers as Record<string, string>;
    return new Response(JSON.stringify({ url: "https://www.asaas.com/c/fixture" }));
  }) as typeof fetch;
  const result = await call(brazilCheckout, { ...donation, amount: 2599 });
  assert.equal(result.status, 200);
  assert.equal(result.body.url, "https://www.asaas.com/c/fixture");
  assert.equal(headers?.access_token, "fixture-token");
  assert.equal(sent?.value, 25.99);
  assert.equal(sent?.billingType, "CREDIT_CARD");
  assert.equal(sent?.chargeType, "DETACHED");
  assert.equal(sent?.callback.successUrl, "https://example.org/?donation=review");
});

test("Asaas defaults to the sandbox unless production is explicit", async () => {
  configureBrazil();
  delete process.env.ASAAS_ENVIRONMENT;
  globalThis.fetch = (async (url) => {
    assert.equal(url, "https://api-sandbox.asaas.com/v3/paymentLinks");
    return new Response(JSON.stringify({ url: "https://sandbox.asaas.com/c/fixture" }));
  }) as typeof fetch;
  assert.equal((await call(brazilCheckout, donation)).status, 200);
  // A production link returned in sandbox mode is unexpected.
  globalThis.fetch = (async () => new Response(JSON.stringify({ url: "https://www.asaas.com/c/fixture" }))) as typeof fetch;
  assert.equal((await call(brazilCheckout, donation)).status, 502);
});

test("Brazilian checkout rejects insecure return URL and untrusted checkout URL", async () => {
  configureBrazil();
  process.env.SITE_URL = "http://example.org";
  assert.equal((await call(brazilCheckout, donation)).status, 503);
  configureBrazil();
  globalThis.fetch = (async () => new Response(JSON.stringify({ url: "https://attacker.example/" }))) as typeof fetch;
  assert.equal((await call(brazilCheckout, donation)).status, 502);
});

test("provider errors and timeouts do not return a payment link or fall back to Stripe", async () => {
  configureBrazil();
  sessionsPrototype.create = () => { throw new Error("No fallback allowed"); };
  globalThis.fetch = (async () => new Response("unavailable", { status: 503 })) as typeof fetch;
  const failure = await call(brazilCheckout, donation);
  assert.equal(failure.status, 502);
  assert.equal(failure.body.url, undefined);
  globalThis.fetch = (async () => { throw new Error("timeout"); }) as typeof fetch;
  assert.equal((await call(brazilCheckout, donation)).status, 502);
});
