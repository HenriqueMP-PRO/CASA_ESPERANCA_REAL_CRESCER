import { useTranslation } from "react-i18next";
import ResponsiveImg from "./ResponsiveImg";
import type { Project } from "../content/site";

export default function Projects({ projects }: { projects: Project[] }) {
  const { t } = useTranslation();

  return (
    <section className="section projects" id="projetos">
      <div className="container">
        <span className="section-tag">{t("projects.tag")}</span>
        <h2>{t("projects.title")}</h2>
        <p className="lead">{t("projects.subtitle")}</p>
        <div className="projects-grid">
          {projects.map((p) => {
            return (
              <article className="project-card" key={p.id}>
                <ResponsiveImg
                  src={p.image}
                  sizes="(max-width: 640px) 92vw, 360px"
                  alt=""
                  loading="lazy"
                />
                <div className="project-body">
                  <h3>{t(`projects.items.${p.i18nKey}.title`)}</h3>
                  <p>{t(`projects.items.${p.i18nKey}.description`)}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
