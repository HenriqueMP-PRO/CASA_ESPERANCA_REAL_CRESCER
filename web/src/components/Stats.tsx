import { useTranslation } from "react-i18next";
import type { SiteContent } from "../content/fallback";

export default function Stats({ stats }: { stats: SiteContent["stats"] }) {
  const { t } = useTranslation();
  const items = [
    { value: `${stats.years}+`, label: t("stats.years") },
    { value: `${stats.communities}+`, label: t("stats.communities") },
    { value: String(stats.countries), label: t("stats.countries") },
    { value: String(stats.founded), label: t("stats.since") },
  ];
  return (
    <section className="stats">
      <div className="container stats-grid">
        {items.map((s) => (
          <div key={s.label}>
            <div className="stat-number">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
