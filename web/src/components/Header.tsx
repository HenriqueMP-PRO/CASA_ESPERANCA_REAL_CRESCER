import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const LANGS = [
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
] as const;

const LINKS = [
  { href: "#historia", key: "nav.about" },
  { href: "#projetos", key: "nav.projects" },
  { href: "#fundador", key: "nav.founder" },
  { href: "#galeria", key: "nav.gallery" },
  { href: "#contato", key: "nav.contact" },
] as const;

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#1e4d2b" />
      <path
        d="M16 25s-8-4.9-8-10.4C8 11 10.4 9 13 9c1.7 0 2.6.8 3 1.6.4-.8 1.3-1.6 3-1.6 2.6 0 5 2 5 5.6C24 20.1 16 25 16 25z"
        fill="#e9a13b"
      />
    </svg>
  );
}

export default function Header() {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const currentLang = i18n.resolvedLanguage ?? "pt";

  return (
    <header className={`header${scrolled ? " scrolled" : ""}`}>
      <div className="container header-inner">
        <a href="#" className="brand" onClick={() => setOpen(false)}>
          <Logo />
          <span>Casa Esperança Real Crescer</span>
        </a>

        <nav className={`nav${open ? " open" : ""}`}>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {t(l.key)}
            </a>
          ))}
          <div className="lang-switch" role="group" aria-label="Language">
            {LANGS.map((l) => (
              <button
                key={l.code}
                className={currentLang.startsWith(l.code) ? "active" : ""}
                onClick={() => i18n.changeLanguage(l.code)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <a href="#doar" className="btn btn-primary" onClick={() => setOpen(false)}>
            {t("nav.donate")}
          </a>
        </nav>

        <button
          className={`menu-toggle${open ? " open" : ""}`}
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>
    </header>
  );
}
