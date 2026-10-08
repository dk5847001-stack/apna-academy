import { useEffect, useState } from "react";

const MICROSOFT_STORE_URL =
  "https://apps.microsoft.com/detail/9N4MKMNT987P?hl=en-in&gl=IN&ocid=pdpshare";

function ApnaAcademyIcon() {
  return (
    <img
      src="/favicon.png"
      alt="ApnaAcademy app icon"
      className="h-full w-full rounded-[30%] object-cover"
      draggable="false"
    />
  );
}

function MicrosoftStoreIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className="h-6 w-6 shrink-0 sm:h-11 sm:w-11"
    >
      <rect x="7" y="9" width="34" height="32" rx="5" fill="white" />
      <path d="M13 15h9v9h-9z" fill="#f25022" />
      <path d="M24 15h11v9H24z" fill="#7fba00" />
      <path d="M13 25h9v11h-9z" fill="#00a4ef" />
      <path d="M24 25h11v11H24z" fill="#ffb900" />
      <path
        d="M17 8c.8-3 3.1-4.5 7-4.5S30.2 5 31 8"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function MicrosoftStoreDownloadPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOpen(true);
    }, 10000);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1600] flex items-center justify-center bg-slate-950/75 dark:bg-black/70 px-4 py-5 backdrop-blur-[5px] sm:px-6 sm:py-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="microsoft-store-popup-title"
        aria-describedby="microsoft-store-popup-description"
        className="relative max-h-[calc(100vh-40px)] w-full max-w-[600px] overflow-y-auto rounded-[20px] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.16)] dark:border-[var(--aa-border)] dark:bg-[var(--aa-surface)] dark:shadow-[0_28px_90px_rgba(0,0,0,0.5)] sm:max-h-[calc(100vh-48px)]"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close Microsoft Store download popup"
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-[var(--aa-text-muted)] dark:hover:bg-[var(--aa-surface-raised)] dark:hover:text-[var(--aa-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 sm:right-4 sm:top-4"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8">
            <path
              d="m6 6 12 12M18 6 6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="grid min-h-0 grid-cols-1 items-center lg:min-h-0 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="relative flex min-h-[150px] items-center justify-center overflow-hidden bg-white px-6 pt-8 lg:min-h-[350px] dark:bg-[var(--aa-surface)] lg:px-8 lg:pt-0">
            <div className="relative flex h-[96px] w-[96px] items-center justify-center sm:h-[108px] sm:w-[108px]">
              <ApnaAcademyIcon />
            </div>
          </div>

          <div className="flex flex-col justify-center px-5 pb-5 pt-2 sm:px-6 lg:px-7 lg:py-6">
            <div className="max-w-[650px] lg:pt-2">
              <h2
                id="microsoft-store-popup-title"
                className="text-2xl font-extrabold leading-[1.04] tracking-[-0.045em] text-slate-950 dark:text-[var(--aa-text-primary)] sm:text-3xl lg:text-[34px]"
              >
                Get ApnaAcademy
                <span className="block text-blue-600">for Windows</span>
              </h2>

              <p
                id="microsoft-store-popup-description"
                className="mt-3 max-w-[460px] text-xs leading-5 text-slate-500 dark:text-[var(--aa-text-muted)] sm:text-sm sm:leading-6"
              >
                Download the official ApnaAcademy app from Microsoft Store and
                start your learning journey today.
              </p>

              <a
                href={MICROSOFT_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex w-full max-w-[360px] items-center justify-center gap-4 rounded-[18px] bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-2.5 text-left text-white no-underline shadow-[0_14px_30px_rgba(37,99,235,0.24)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(37,99,235,0.3)] focus:outline-none focus:ring-4 focus:ring-blue-200 sm:px-4 sm:py-3"
              >
                <MicrosoftStoreIcon />
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium leading-5 sm:text-base">
                    Get it from
                  </span>
                  <span className="text-base font-bold leading-5 sm:text-lg">
                    Microsoft Store
                  </span>
                </span>
                <svg
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                  className="ml-auto h-8 w-8 shrink-0 sm:h-9 sm:w-9"
                  fill="none"
                >
                  <path
                    d="M6 16h19M18 8l8 8-8 8"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>

            <div className="mt-5 grid max-w-[500px] grid-cols-3 border-t border-slate-100 dark:border-[var(--aa-border)] pt-3">
              <div className="flex items-center justify-center gap-2 border-r border-slate-200 px-2 text-center text-[10px] font-semibold text-slate-700 dark:border-[var(--aa-border)] dark:text-[var(--aa-text-secondary)] sm:gap-3 sm:text-[11px]">
                <span className="text-blue-600">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                    <path
                      d="M12 3 19 6v5c0 4.5-3 7.5-7 10-4-2.5-7-5.5-7-10V6l7-3Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="m9 12 2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span>Safe &amp; Secure</span>
              </div>

              <div className="flex items-center justify-center gap-2 border-r border-slate-200 px-2 text-center text-xs font-semibold text-slate-700 dark:text-[var(--aa-text-secondary)] dark:border-[var(--aa-border)] dark:text-[var(--aa-text-secondary)] sm:gap-3 sm:text-sm">
                <span className="text-blue-600">
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
                    <path
                      d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span>Fast Installation</span>
              </div>

              <div className="flex items-center justify-center gap-2 px-2 text-center text-xs font-semibold text-slate-700 sm:gap-3 sm:text-sm">
                <span className="text-blue-600">
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="13"
                      rx="1.5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M8 21h8M12 17v4"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span>Works on Windows PC</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
