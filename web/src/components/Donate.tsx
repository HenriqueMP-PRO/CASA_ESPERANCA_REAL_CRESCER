import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type Currency = "brl" | "usd" | "eur" | "gbp";
type Frequency = "once" | "monthly";

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

export default function Donate() {
  const { t, i18n } = useTranslation();
  const [currency, setCurrency] = useState<Currency>("brl");
  const [frequency, setFrequency] = useState<Frequency>("once");
  const [preset, setPreset] = useState<number | null>(50);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = useMemo(() => {
    if (custom.trim() !== "") {
      const parsed = Number(custom.replace(",", "."));
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }
    return preset;
  }, [custom, preset]);

  const formatted = useMemo(() => {
    if (!amount) return null;
    return new Intl.NumberFormat(i18n.resolvedLanguage, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  }, [amount, currency, i18n.resolvedLanguage]);

  const selectCurrency = (c: Currency) => {
    setCurrency(c);
    setPreset(PRESETS[c][1]);
    setCustom("");
  };

  const donate = async () => {
    setError(null);
    if (!amount) {
      setError(t("donate.error_amount"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency,
          frequency,
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

          <span className="field-label">{t("donate.frequency")}</span>
          <div className="freq-toggle">
            <button
              className={`chip${frequency === "once" ? " active" : ""}`}
              onClick={() => setFrequency("once")}
            >
              {t("donate.once")}
            </button>
            <button
              className={`chip${frequency === "monthly" ? " active" : ""}`}
              onClick={() => setFrequency("monthly")}
            >
              {t("donate.monthly")}
            </button>
          </div>

          <span className="field-label">{t("donate.currency")}</span>
          <div className="currency-row">
            {(Object.keys(PRESETS) as Currency[]).map((c) => (
              <button
                key={c}
                className={`chip${currency === c ? " active" : ""}`}
                onClick={() => selectCurrency(c)}
              >
                {c.toUpperCase()}
              </button>
            ))}
          </div>

          <span className="field-label">{t("donate.amount")}</span>
          <div className="amount-grid">
            {PRESETS[currency].map((v) => (
              <button
                key={v}
                className={`chip${preset === v && custom === "" ? " active" : ""}`}
                onClick={() => {
                  setPreset(v);
                  setCustom("");
                }}
              >
                {SYMBOLS[currency]} {v}
              </button>
            ))}
          </div>
          <div className="custom-amount">
            <span>{SYMBOLS[currency]}</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder={t("donate.custom_placeholder")}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              aria-label={t("donate.custom_placeholder")}
            />
          </div>

          <button className="btn btn-primary" onClick={donate} disabled={loading}>
            {loading
              ? t("donate.processing")
              : formatted
                ? t("donate.button", { amount: formatted })
                : t("donate.button_empty")}
          </button>
          {error && <p className="donate-error">{error}</p>}
          <p className="secure-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            {t("donate.secure_note")}
          </p>
        </div>
      </div>
    </section>
  );
}
