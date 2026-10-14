import { Trans, useTranslation } from "react-i18next";
import ResponsiveImg from "./ResponsiveImg";

export default function Hero({ image }: { image: string }) {
  const { t } = useTranslation();
  return (
    <section className="hero" id="inicio">
      <ResponsiveImg className="hero-bg" src={image} sizes="100vw" alt="" fetchPriority="high" />
      <div className="container">
        <div className="hero-content">
          <h1>
            <Trans i18nKey="hero.title" components={{ 1: <em /> }} />
          </h1>
          <p>{t("hero.subtitle")}</p>
          <div className="hero-actions">
            <a href="#doar" className="btn btn-primary">
              {t("hero.cta_donate")}
            </a>
            <a href="#projetos" className="btn btn-outline">
              {t("hero.cta_learn")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
