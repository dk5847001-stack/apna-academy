import { useEffect, useState } from "react";

const MICROSOFT_STORE_URL =
  "https://apps.microsoft.com/detail/9N4MKMNT987P?hl=en-in&gl=IN&ocid=pdpshare";

function GraduationCapIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="h-20 w-20 sm:h-24 sm:w-24"
      fill="none"
    >
      <path
        d="M8 26 32 14l24 12-24 12L8 26Z"
        fill="currentColor"
        opacity=".98"
      />
      <path
        d="M18 32v10c8 7 20 9 28 0V32l-14 7-14-7Z"
        fill="currentColor"
        opacity=".98"
      />
      <path
        d="M54 27v13"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="54" cy="42" r="3" fill="currentColor" />
    </svg>
  );
}

function MicrosoftStoreIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className="h-10 w-10 shrink-0 sm:h-11 sm:w-11"
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
      className="fixed inset-0 z-[1600] flex items-center justify-center bg-white/75 px-4 py-5 backdrop-blur-[5px] sm:px-6 sm:py-6"
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
        className="relative max-h-[calc(100vh-40px)] w-full max-w-[1220px] overflow-y-auto rounded-[20px] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.16)] sm:max-h-[calc(100vh-48px)]"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close Microsoft Store download popup"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:right-6 sm:top-5"
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

        <div className="grid min-h-[680px] grid-cols-1 items-center lg:min-h-[760px] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-white px-8 pt-12 lg:min-h-[760px] lg:px-12 lg:pt-0">
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rotate-[-10deg] rounded-[76px] bg-gradient-to-br from-blue-50 via-blue-100/80 to-white shadow-[0_20px_50px_rgba(37,99,235,0.08)]"
            />
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[270px] w-[270px] -translate-x-1/2 -translate-y-1/2 rounded-[58px] bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 shadow-[0_25px_55px_rgba(37,99,235,0.28)]"
            />
            <div className="relative flex h-[235px] w-[235px] items-center justify-center rounded-[48px] sm:h-[250px] sm:w-[250px] bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white shadow-[0_20px_45px_rgba(37,99,235,0.3)] sm:h-[205px] sm:w-[205px] sm:rounded-[44px]">
              <GraduationCapIcon />
            </div>
          </div>

          <div className="flex flex-col justify-center px-7 pb-9 pt-4 sm:px-10 lg:px-12 lg:py-12">
            <div className="max-w-[650px] lg:pt-2">
              <h2
                id="microsoft-store-popup-title"
                className="text-4xl font-extrabold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[58px]"
              >
                Get ApnaAcademy
                <span className="block text-blue-600">for Windows</span>
              </h2>

              <p
                id="microsoft-store-popup-description"
                className="mt-6 max-w-[570px] text-base leading-7 text-slate-500 sm:text-lg sm:leading-8"
              >
                Download the official ApnaAcademy app from Microsoft Store and
                start your learning journey today.
              </p>

              <a
                href={MICROSOFT_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex w-full max-w-[500px] items-center justify-center gap-4 rounded-[18px] bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-4 text-left text-white no-underline shadow-[0_14px_30px_rgba(37,99,235,0.24)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(37,99,235,0.3)] focus:outline-none focus:ring-4 focus:ring-blue-200 sm:px-7 sm:py-5"
              >
                <MicrosoftStoreIcon />
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium leading-5 sm:text-base">
                    Get it from
                  </span>
                  <span className="text-xl font-bold leading-6 sm:text-2xl">
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

            <div className="mt-9 grid max-w-[650px] grid-cols-3 border-t border-slate-100 pt-6">
              <div className="flex items-center justify-center gap-2 border-r border-slate-200 px-2 text-center text-xs font-semibold text-slate-700 sm:gap-3 sm:text-sm">
                <span className="text-blue-600">
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
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

              <div className="flex items-center justify-center gap-2 border-r border-slate-200 px-2 text-center text-xs font-semibold text-slate-700 sm:gap-3 sm:text-sm">
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
