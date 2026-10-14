import { useTranslation } from "react-i18next";
import { Logo } from "./Header";

export default function Footer({ orgName }: { orgName: string }) {
  const { t } = useTranslation();
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <a href="#" className="brand">
          <Logo size={28} />
          <span>{orgName}</span>
        </a>
        <p>{t("footer.tagline")}</p>
        <a href="#doar" className="btn btn-primary">
          {t("nav.donate")}
        </a>
        <p>
          © {new Date().getFullYear()} {orgName}. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
