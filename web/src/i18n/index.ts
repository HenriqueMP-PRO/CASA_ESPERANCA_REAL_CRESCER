import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import pt from "./pt.json";
import en from "./en.json";
import fr from "./fr.json";

function setHtmlLang(lng: string) {
  document.documentElement.lang = lng.slice(0, 2);
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
    fallbackLng: "pt",
    supportedLngs: ["pt", "en", "fr"],
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  });

i18n.on("languageChanged", setHtmlLang);
setHtmlLang(i18n.resolvedLanguage ?? i18n.language ?? "pt");

export default i18n;
