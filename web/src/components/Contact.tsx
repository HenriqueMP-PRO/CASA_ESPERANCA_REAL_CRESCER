import { useTranslation } from "react-i18next";
import type { SiteContent } from "../content/fallback";

export default function Contact({ contact }: { contact: SiteContent["contact"] }) {
  const { t } = useTranslation();
  return (
    <section className="section" id="contato">
      <div className="container">
        <span className="section-tag">{t("contact.tag")}</span>
        <h2>{t("contact.title")}</h2>
        <div className="contact-grid">
          <div className="contact-card">
            <h3>📍 {t("contact.address_title")}</h3>
            <p>{contact.address}</p>
          </div>
          <div className="contact-card">
            <h3>📞 {t("contact.phone_title")}</h3>
            {contact.phones.map((p) => (
              <p key={p}>
                <a href={`tel:+55${p.replace(/\D/g, "")}`}>{p}</a>
              </p>
            ))}
          </div>
          <div className="contact-card">
            <h3>✉️ {t("contact.email_title")}</h3>
            <p>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </p>
          </div>
          <div className="contact-card">
            <h3>🏛️ {t("contact.org_title")}</h3>
            <p>{contact.orgName}</p>
            <p>CNPJ: {contact.cnpj}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
