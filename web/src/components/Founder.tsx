import { useTranslation } from "react-i18next";

export default function Founder({ image }: { image: string }) {
  const { t } = useTranslation();
  return (
    <section className="section" id="fundador">
      <div className="container founder-grid">
        <img src={image} alt={t("founder.title")} loading="lazy" />
        <div className="founder-text">
          <span className="section-tag">{t("founder.tag")}</span>
          <h2>{t("founder.title")}</h2>
          <p>{t("founder.p1")}</p>
          <blockquote>“{t("founder.quote")}”</blockquote>
          <p>{t("founder.p2")}</p>
        </div>
      </div>
    </section>
  );
}
