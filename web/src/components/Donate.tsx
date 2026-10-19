import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import * as QRCode from "qrcode";
import { siteContent } from "../content/site";
import { buildPixPayload } from "../lib/pix";

type Currency = "brl" | "usd" | "eur" | "gbp";
type Frequency = "once" | "monthly";
type PaymentMethod = "pix" | "card";

// Email key and holder confirmed in a bank app against the Banco do Brasil
// account on 2026-10-18; the holder CNPJ matches the institution's.
const PIX_KEY = "casaesperancarealcrescer@gmail.com";
const BB_ACCOUNT_CNPJ = siteContent.contact.cnpj;
const BRAZIL_CARD_ENABLED = import.meta.env.VITE_BRAZIL_PAYMENTS_ENABLED === "true";
const PIX_RECEIVER = "CASA ESPERANCA REAL - CRESCER";
// The Pix payload caps the name at 25 characters; banks show the registered one.
const PIX_QR_NAME = "CASA ESPERANCA REAL";
const PIX_BANK = "Banco do Brasil (001)";
const PIX_CITY = "Rio de Janeiro";
const BB_AGENCY = "3101-1";
const BB_ACCOUNT = "3395-2";
// Asaas does not accept charges below R$ 5,00.
const BRL_CARD_MIN = 5;

// Pix needs either a key (QR / copy-and-paste) or the holder's CNPJ (manual
// transfer by branch and account). Without both, donors can't complete it.
const PIX_READY = Boolean(PIX_KEY || BB_ACCOUNT_CNPJ);
const BRL_AVAILABLE = PIX_READY || BRAZIL_CARD_ENABLED;

const PRESETS: Record<Currency, number[]> = {
  brl: [25, 50, 100, 200, 500, 1000],
  usd: [5, 10, 25, 50, 100, 250],
  eur: [5, 10, 25, 50, 100, 250],
  gbp: [5, 10, 25, 50, 100, 250],
};

const SYMBOLS: Record<Currency, string> = {
  brl: "R$",
  usd: "$",
  eur: "€",
  gbp: "£",
};

function currencyForLanguage(lang: string | undefined): Currency {
  if (lang?.startsWith("pt")) return "brl";
  if (lang?.startsWith("fr")) return "eur";
  return "usd";
}

function CopyRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <dt>{label}</dt>
      <dd>
        <span>{value}</span>
        <button
          type="button"
          className="copy-inline"
          onClick={onCopy}
          aria-label={`${t("donate.copy")} ${label}`}
        >
          {copied ? t("donate.pix_copied") : t("donate.copy")}
        </button>
      </dd>
    </div>
  );
}

export default function Donate({ whatsapp }: { whatsapp: string }) {
  const { t, i18n } = useTranslation();
  // Until the donor picks a currency, it follows the site language.
  const [chosenCurrency, setChosenCurrency] = useState<Currency | null>(null);
  const currency = chosenCurrency ?? currencyForLanguage(i18n.resolvedLanguage);
  const [frequency, setFrequency] = useState<Frequency>("once");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PIX_READY ? "pix" : "card");
  const [preset, setPreset] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixQrCode, setPixQrCode] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const isBrazil = currency === "brl";
  const isPix = isBrazil && paymentMethod === "pix" && PIX_READY;
  const presets = PRESETS[currency];
  const selectedPreset = preset !== null && presets.includes(preset) ? preset : presets[1];

  const amount = useMemo(() => {
    if (custom.trim() !== "") {
      const parsed = Number(custom.replace(",", "."));
      return Number.isFinite(parsed) && parsed >= 1 && parsed <= 1_000_000
        && Math.abs(parsed * 100 - Math.round(parsed * 100)) < 0.000001 ? parsed : null;
    }
    return selectedPreset;
  }, [custom, selectedPreset]);

  const formatted = useMemo(() => {
    if (!amount) return null;
    return new Intl.NumberFormat(i18n.resolvedLanguage, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  }, [amount, currency, i18n.resolvedLanguage]);

  const selectCurrency = (c: Currency) => {
    setChosenCurrency(c);
    setPreset(null);
    setCustom("");
    setPaymentMethod(PIX_READY ? "pix" : "card");
    setError(null);
    setCopied(null);
    setFrequency("once");
  };

  const pixPayload = useMemo(() => {
    if (!isPix || !amount || !PIX_KEY) return "";

    return buildPixPayload({
      key: PIX_KEY,
      receiverName: PIX_QR_NAME,
      city: PIX_CITY,
      amount,
    });
  }, [amount, isPix]);

  useEffect(() => {
    let isCurrent = true;

    if (!pixPayload) {
      setPixQrCode("");
      return;
    }

    QRCode.toDataURL(pixPayload, {
      width: 216,
      margin: 2,
      errorCorrectionLevel: "M",
      color: {
        dark: "#143520",
        light: "#ffffff",
      },
    })
      .then((url) => {
        if (isCurrent) setPixQrCode(url);
      })
      .catch((err: unknown) => {
        console.error("Could not generate Pix QR code", err);
        if (isCurrent) setPixQrCode("");
      });

    return () => {
      isCurrent = false;
    };
  }, [pixPayload]);

  const copy = async (value: string, id: string) => {
    setError(null);
    try {
      await navigator.clipboard.writeText(value);
      setCopied(id);
      window.setTimeout(() => setCopied((c) => (c === id ? null : c)), 2000);
    } catch (err) {
      console.error(err);
      setError(t("donate.error_copy_pix"));
    }
  };

  const donate = async () => {
    setError(null);
    if (!amount) {
      setError(t("donate.error_amount"));
      return;
    }
    if (isPix) {
      if (pixPayload) await copy(pixPayload, "code");
      return;
    }
    if (isBrazil && amount < BRL_CARD_MIN) {
      setError(t("donate.error_card_min"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(isBrazil ? "/api/create-br-checkout" : "/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency,
          frequency: isBrazil ? "once" : frequency,
          locale: i18n.resolvedLanguage?.slice(0, 2) ?? "pt",
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { url?: string };
      if (!data.url) throw new Error("Missing checkout URL");
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setError(t("donate.error_generic"));
      setLoading(false);
    }
  };

  const bankRows = (
    <>
      <CopyRow
        label={t("donate.bank_agency")}
        value={BB_AGENCY}
        copied={copied === "agency"}
        onCopy={() => copy(BB_AGENCY, "agency")}
      />
      <CopyRow
        label={t("donate.bank_account")}
        value={BB_ACCOUNT}
        copied={copied === "account"}
        onCopy={() => copy(BB_ACCOUNT, "account")}
      />
      {BB_ACCOUNT_CNPJ && (
        <CopyRow
          label="CNPJ"
          value={BB_ACCOUNT_CNPJ}
          copied={copied === "cnpj"}
          onCopy={() => copy(BB_ACCOUNT_CNPJ, "cnpj")}
        />
      )}
    </>
  );

  const brlUnavailable = isBrazil && !BRL_AVAILABLE;
  // Manual Pix (no key): the donor types the amount in their bank app.
  const showAmount = !brlUnavailable && !(isPix && !PIX_KEY);
  const showMainButton = !brlUnavailable && !(isPix && !pixPayload);

  return (
    <section className="section donate" id="doar">
      <div className="container donate-grid">
        <div className="donate-info">
          <span className="section-tag">{t("donate.tag")}</span>
          <h2>{t("donate.title")}</h2>
          <p>{t("donate.p1")}</p>
          <ul className="donate-features">
            <li>{t("donate.features.secure")}</li>
            <li>{t("donate.features.international")}</li>
            <li>{t("donate.features.recurring")}</li>
            <li>{t("donate.features.receipt")}</li>
          </ul>
        </div>

        <div className="donate-card">
          <h3>{t("donate.card_title")}</h3>

          <span className="field-label" id="donate-currency">{t("donate.currency")}</span>
          <div className="currency-row" role="group" aria-labelledby="donate-currency">
            {(Object.keys(PRESETS) as Currency[]).map((c) => (
              <button
                key={c}
                type="button"
                className={`chip${currency === c ? " active" : ""}`}
                aria-pressed={currency === c}
                onClick={() => selectCurrency(c)}
              >
                {c.toUpperCase()}
              </button>
            ))}
          </div>

          {brlUnavailable && (
            <div className="donate-notice">
              <p>{t("donate.brazil_unavailable")}</p>
              <a
                className="btn btn-whatsapp"
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(t("donate.whatsapp_message"))}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("contact.whatsapp_cta")}
              </a>
            </div>
          )}

          {isBrazil && PIX_READY && BRAZIL_CARD_ENABLED && (
            <>
              <span className="field-label" id="donate-method">{t("donate.payment_method")}</span>
              <div className="payment-method-row" role="group" aria-labelledby="donate-method">
                {(["pix", "card"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`chip${paymentMethod === m ? " active" : ""}`}
                    aria-pressed={paymentMethod === m}
                    onClick={() => {
                      setPaymentMethod(m);
                      setError(null);
                    }}
                  >
                    {t(`donate.${m}`)}
                  </button>
                ))}
              </div>
            </>
          )}

          {!isBrazil && (
            <>
              <span className="field-label" id="donate-frequency">{t("donate.frequency")}</span>
              <div className="freq-toggle" role="group" aria-labelledby="donate-frequency">
                {(["once", "monthly"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`chip${frequency === f ? " active" : ""}`}
                    aria-pressed={frequency === f}
                    onClick={() => setFrequency(f)}
                  >
                    {t(`donate.${f}`)}
                  </button>
                ))}
              </div>
            </>
          )}

          {showAmount && (
            <>
              <span className="field-label" id="donate-amount">{t("donate.amount")}</span>
              <div className="amount-grid" role="group" aria-labelledby="donate-amount">
                {presets.map((v) => {
                  const active = selectedPreset === v && custom === "";
                  return (
                    <button
                      key={v}
                      type="button"
                      className={`chip${active ? " active" : ""}`}
                      aria-pressed={active}
                      onClick={() => {
                        setPreset(v);
                        setCustom("");
                      }}
                    >
                      {SYMBOLS[currency]} {v}
                    </button>
                  );
                })}
              </div>
              <div className="custom-amount">
                <span aria-hidden="true">{SYMBOLS[currency]}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder={t("donate.custom_placeholder")}
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  aria-label={`${t("donate.custom_placeholder")} (${currency.toUpperCase()})`}
                />
              </div>
            </>
          )}

          {isPix && (
            <div className="pix-payment">
              {PIX_KEY ? (
                <>
                  <p className="pix-step">{t("donate.pix_qr_instructions")}</p>
                  <div className="pix-qr-wrap">
                    {pixQrCode && (
                      <img
                        src={pixQrCode}
                        alt={t("donate.pix_qr_alt")}
                        width="216"
                        height="216"
                      />
                    )}
                  </div>
                  {pixPayload && (
                    <details className="pix-code-details">
                      <summary>{t("donate.pix_code_label")}</summary>
                      <textarea
                        className="pix-code"
                        value={pixPayload}
                        readOnly
                        aria-label={t("donate.pix_code_label")}
                      />
                    </details>
                  )}
                </>
              ) : (
                <p className="pix-step">{t("donate.bank_manual_note")}</p>
              )}

              <dl className="pix-details">
                <div>
                  <dt>{t("donate.pix_receiver")}</dt>
                  <dd><span>{PIX_RECEIVER}</span></dd>
                </div>
                <div>
                  <dt>{t("donate.pix_bank")}</dt>
                  <dd><span>{PIX_BANK}</span></dd>
                </div>
                {PIX_KEY && (
                  <CopyRow
                    label={t("donate.pix_key")}
                    value={PIX_KEY}
                    copied={copied === "key"}
                    onCopy={() => copy(PIX_KEY, "key")}
                  />
                )}
              </dl>

              {/* Only needed for Pix by branch and account, so it stays folded when there is a key. */}
              {PIX_KEY ? (
                <details className="pix-code-details">
                  <summary>{t("donate.bank_details_label")}</summary>
                  <dl className="pix-details pix-details-folded">{bankRows}</dl>
                </details>
              ) : (
                <dl className="pix-details">{bankRows}</dl>
              )}

              {whatsapp && (
                <p className="pix-note">
                  {t("donate.pix_receipt_prompt")}{" "}
                  <a
                    href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(t("donate.pix_receipt_message"))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("donate.pix_receipt_link")}
                  </a>
                </p>
              )}
            </div>
          )}

          {showMainButton && (
            <button className="btn btn-primary" onClick={donate} disabled={loading}>
              {isPix
                ? copied === "code"
                  ? t("donate.pix_copied")
                  : t("donate.pix_copy_code")
                : loading
                  ? t("donate.processing")
                  : formatted
                    ? t("donate.button", { amount: formatted })
                    : t("donate.button_empty")}
            </button>
          )}
          <p className="donate-error" role="alert">{error}</p>
          {!brlUnavailable && (
            <p className="secure-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              {isPix ? t("donate.pix_secure_note") : isBrazil ? t("donate.brazil_secure_note") : t("donate.secure_note")}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
