import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import pt from "./pt.json";
import en from "./en.json";
import fr from "./fr.json";

export const SUPPORTED_LANGS = ["pt", "en", "fr"] as const;

/** Only a language picked in the switcher is stored; otherwise the device decides. */
const CHOSEN_LANG_KEY = "cerc-lang";

// Earlier versions cached the auto-detected language under i18next's default
// key, which pinned returning visitors to it even after changing their device.
try {
  localStorage.removeItem("i18nextLng");
} catch {
  // Storage can be unavailable (private mode, blocked cookies).
}

function setHtmlLang(lng: string) {
  document.documentElement.lang = lng.slice(0, 2);
}

export function chooseLanguage(lng: string) {
  try {
    localStorage.setItem(CHOSEN_LANG_KEY, lng);
  } catch {
    // Still switch for this visit.
  }
  void i18n.changeLanguage(lng);
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: pt },
      en: { translation: en },
      fr: { translation: fr },
    },
    // Visitors whose device language is not PT/FR get English.
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGS,
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    interpolation: { escapeValue: false },
    detection: {
      order: ["querystring", "localStorage", "navigator"],
      lookupQuerystring: "lang",
      lookupLocalStorage: CHOSEN_LANG_KEY,
      caches: [],
    },
  });

i18n.on("languageChanged", setHtmlLang);
setHtmlLang(i18n.resolvedLanguage ?? i18n.language ?? "pt");

export default i18n;
