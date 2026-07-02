import { useTranslation } from "react-i18next";
import type { Lang, Project } from "../content/fallback";

export default function Projects({ projects }: { projects: Project[] }) {
  const { t, i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage?.slice(0, 2) ?? "pt") as Lang;

  return (
    <section className="section projects" id="projetos">
      <div className="container">
        <span className="section-tag">{t("projects.tag")}</span>
        <h2>{t("projects.title")}</h2>
        <p className="lead">{t("projects.subtitle")}</p>
        <div className="projects-grid">
          {projects.map((p) => {
            const title =
              p.title?.[lang] ?? (p.i18nKey ? t(`projects.items.${p.i18nKey}.title`) : "");
            const description =
              p.description?.[lang] ??
              (p.i18nKey ? t(`projects.items.${p.i18nKey}.description`) : "");
            return (
              <article className="project-card" key={p.id}>
                <img src={p.image} alt={title} loading="lazy" />
                <div className="project-body">
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
