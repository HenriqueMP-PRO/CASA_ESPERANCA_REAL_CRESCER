import { useTranslation } from "react-i18next";

export default function About({ image }: { image: string }) {
  const { t } = useTranslation();
  return (
    <section className="section" id="historia">
      <div className="container about-grid">
        <div className="about-image">
          <img src={image} alt={t("about.title")} loading="lazy" />
          <div className="about-badge">
            {t("about.badge_label")}
            <span>{t("about.badge_number")}</span>
          </div>
        </div>
        <div className="about-text">
          <span className="section-tag">{t("about.tag")}</span>
          <h2>{t("about.title")}</h2>
          <p>{t("about.p1")}</p>
          <p>{t("about.p2")}</p>
          <p>{t("about.p3")}</p>
        </div>
      </div>
    </section>
  );
}
