import { useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import { useTranslation } from "react-i18next";
import type { GalleryImage } from "../content/site";
import { largestImage } from "../lib/images";
import ResponsiveImg from "./ResponsiveImg";

const SWIPE_THRESHOLD = 50;

export default function Gallery({ images }: { images: GalleryImage[] }) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStartX = useRef<number | null>(null);
  const [current, setCurrent] = useState<number | null>(null);

  const captionOf = (img: GalleryImage) => t(`gallery.captions.${img.captionKey}`);

  const total = images.length;
  const show = (index: number) => setCurrent((index + total) % total);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (current !== null && !dialog.open) dialog.showModal();
    if (current === null && dialog.open) dialog.close();
  }, [current]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (current === null) return;
    if (e.key === "ArrowRight") show(current + 1);
    if (e.key === "ArrowLeft") show(current - 1);
  };

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (current === null || touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    show(delta < 0 ? current + 1 : current - 1);
  };

  const active = current !== null ? images[current] : null;

  return (
    <section className="section gallery" id="galeria">
      <div className="container">
        <span className="section-tag">{t("gallery.tag")}</span>
        <h2>{t("gallery.title")}</h2>
        <p className="lead">{t("gallery.subtitle")}</p>
        <ul className="gallery-grid">
          {images.map((img, i) => (
            <li key={img.src} className={img.tall ? "tall" : undefined}>
              <button
                type="button"
                className="gallery-thumb"
                onClick={() => show(i)}
                aria-label={`${t("gallery.open")}: ${captionOf(img)}`}
              >
                <ResponsiveImg
                  src={img.src}
                  sizes="(max-width: 640px) 46vw, 280px"
                  alt=""
                  loading="lazy"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <dialog
        ref={dialogRef}
        className="lightbox"
        aria-label={t("gallery.title")}
        onClose={() => setCurrent(null)}
        onKeyDown={onKeyDown}
        onClick={(e) => {
          // Clicks outside the photo and controls close the viewer.
          const target = e.target as HTMLElement;
          if (target === e.currentTarget || target.classList.contains("lightbox-inner")) {
            setCurrent(null);
          }
        }}
      >
        {active && current !== null && (
          <div className="lightbox-inner">
            <button
              type="button"
              className="lightbox-close"
              onClick={() => setCurrent(null)}
              aria-label={t("gallery.close")}
            >
              ×
            </button>
            <figure onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <img src={largestImage(active.src)} alt={captionOf(active)} />
              <figcaption>
                <span>{captionOf(active)}</span>
                <span className="lightbox-count">
                  {t("gallery.counter", { current: current + 1, total })}
                </span>
              </figcaption>
            </figure>
            {total > 1 && (
              <>
                <button
                  type="button"
                  className="lightbox-nav prev"
                  onClick={() => show(current - 1)}
                  aria-label={t("gallery.prev")}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="lightbox-nav next"
                  onClick={() => show(current + 1)}
                  aria-label={t("gallery.next")}
                >
                  ›
                </button>
              </>
            )}
          </div>
        )}
      </dialog>
    </section>
  );
}
