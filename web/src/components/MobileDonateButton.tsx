import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

/** Floating "Donate" shortcut on small screens, hidden on the hero and the donate section. */
export default function MobileDonateButton() {
  const { t } = useTranslation();
  const [pastHero, setPastHero] = useState(false);
  const [donateVisible, setDonateVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("inicio");
    const donate = document.getElementById("doar");
    if (!hero || !donate) return;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) setPastHero(!entry.isIntersecting);
        if (entry.target === donate) setDonateVisible(entry.isIntersecting);
      }
    });
    observer.observe(hero);
    observer.observe(donate);
    return () => observer.disconnect();
  }, []);

  const visible = pastHero && !donateVisible;
  return (
    <a
      href="#doar"
      className={`btn btn-primary mobile-donate${visible ? " visible" : ""}`}
      aria-hidden={!visible}
      tabIndex={visible ? undefined : -1}
    >
      {t("nav.donate")}
    </a>
  );
}
