import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type Status = "success" | "canceled" | "review" | null;

export default function DonationStatusModal() {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const donation = params.get("donation");
    if (donation === "success" || donation === "canceled" || donation === "review") {
      setStatus(donation);
      // Clean the URL so refresh doesn't reopen the modal
      const url = new URL(window.location.href);
      url.searchParams.delete("donation");
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    }
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (status && dialog && !dialog.open) dialog.showModal();
  }, [status]);

  if (!status) return null;

  const isSuccess = status === "success";
  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby="donation-status-title"
      onClose={() => setStatus(null)}
      onClick={(e) => {
        if (e.target === e.currentTarget) dialogRef.current?.close();
      }}
    >
      <div className="modal-body">
        <div className="icon" aria-hidden="true">{isSuccess ? "💚" : "🙏"}</div>
        <h3 id="donation-status-title">{t(`${status}.title`)}</h3>
        <p>{t(`${status}.message`)}</p>
        <button className="btn btn-primary" autoFocus onClick={() => dialogRef.current?.close()}>
          {t(`${status}.close`)}
        </button>
      </div>
    </dialog>
  );
}
