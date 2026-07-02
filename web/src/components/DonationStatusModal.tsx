import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type Status = "success" | "canceled" | null;

export default function DonationStatusModal() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const donation = params.get("donation");
    if (donation === "success" || donation === "canceled") {
      setStatus(donation);
      // Clean the URL so refresh doesn't reopen the modal
      const url = new URL(window.location.href);
      url.searchParams.delete("donation");
      window.history.replaceState({}, "", url.pathname + url.hash);
    }
  }, []);

  if (!status) return null;

  const isSuccess = status === "success";
  return (
    <div className="modal-overlay" onClick={() => setStatus(null)} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="icon">{isSuccess ? "💚" : "🙏"}</div>
        <h3>{t(isSuccess ? "success.title" : "canceled.title")}</h3>
        <p>{t(isSuccess ? "success.message" : "canceled.message")}</p>
        <button className="btn btn-primary" onClick={() => setStatus(null)}>
          {t(isSuccess ? "success.close" : "canceled.close")}
        </button>
      </div>
    </div>
  );
}
