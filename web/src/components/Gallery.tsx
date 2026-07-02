import { useTranslation } from "react-i18next";
import type { GalleryImage } from "../content/fallback";

export default function Gallery({ images }: { images: GalleryImage[] }) {
  const { t } = useTranslation();
  return (
    <section className="section gallery" id="galeria">
      <div className="container">
        <span className="section-tag">{t("gallery.tag")}</span>
        <h2>{t("gallery.title")}</h2>
        <p className="lead">{t("gallery.subtitle")}</p>
        <div className="gallery-grid">
          {images.map((img, i) => (
            <img
              key={img.src}
              src={img.src}
              alt={`${t("gallery.title")} ${i + 1}`}
              loading="lazy"
              className={img.tall ? "tall" : ""}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
