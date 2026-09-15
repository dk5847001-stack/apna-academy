import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Crown, LoaderCircle, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import {
  createDsaPremiumOrder,
  getDsaSubscription,
  verifyDsaPremiumPayment,
} from "../services/dsa.service.js";

const RAZORPAY_CHECKOUT_URL = "https://checkout.razorpay.com/v1/checkout.js";
const MAIN_APP_URL = (import.meta.env.VITE_MAIN_APP_URL || "http://localhost:5173").replace(/\/$/, "");

const loadRazorpay = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(window.Razorpay);
    const existing = document.querySelector(`script[src="${RAZORPAY_CHECKOUT_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Razorpay));
      existing.addEventListener("error", () => reject(new Error("Razorpay checkout could not be loaded.")));
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_URL;
    script.async = true;
    script.onload = () => (window.Razorpay ? resolve(window.Razorpay) : reject(new Error("Razorpay checkout is unavailable.")));
    script.onerror = () => reject(new Error("Razorpay checkout could not be loaded."));
    document.body.appendChild(script);
  });

export default function Unlock() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    getDsaSubscription()
      .then((data) => mounted && setSubscription(data))
      .catch((err) => mounted && setError(err.status === 401 ? "Please login to your ApnaAcademy account before unlocking DSA Premium." : err.message))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const handleUnlock = async () => {
    setError("");
    setMessage("");
    setPaying(true);
    try {
      const order = await createDsaPremiumOrder();
      const Razorpay = await loadRazorpay();

      const checkout = new Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "ApnaAcademy",
        description: "DSA Premium — 30 Days",
        order_id: order.orderId,
        theme: { color: "#2563eb" },
        handler: async (response) => {
          try {
            const verified = await verifyDsaPremiumPayment(response);
            setSubscription((current) => ({
              ...(current || {}),
              premium: true,
              accessType: "PREMIUM",
              expiresAt: verified.expiresAt,
            }));
            setMessage("Payment verified. DSA Premium is now unlocked.");
            setTimeout(() => navigate("/practice"), 900);
          } catch (err) {
            setError(err.message || "Payment verification failed.");
          } finally {
            setPaying(false);
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      });

      checkout.on("payment.failed", (response) => {
        setPaying(false);
        setError(response?.error?.description || "Payment failed. No premium access was activated.");
      });
      checkout.open();
    } catch (err) {
      setPaying(false);
      setError(err.status === 401 ? "Please login first, then return to DSA Premium." : err.message);
    }
  };

  if (loading) {
    return <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }

  if (subscription?.premium) {
    return <section className="mx-auto max-w-3xl rounded-[28px] border border-emerald-200 bg-white p-7 text-center shadow-sm sm:p-10">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><ShieldCheck className="h-8 w-8" /></div>
      <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Premium active</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Your DSA library is unlocked.</h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">You have premium access. Continue solving problems, studying company patterns and building your streak.</p>
      <button type="button" onClick={() => navigate("/practice")} className="mt-7 rounded-xl bg-slate-950 px-6 py-3 text-sm font-black text-white hover:bg-slate-800">Go to Practice</button>
    </section>;
  }

  return <section className="mx-auto max-w-5xl">
    <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
      <div className="relative overflow-hidden bg-slate-950 px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-black text-blue-200"><Crown className="h-4 w-4" /> DSA Premium</div>
          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">Unlock the full DSA library.</h1>
          <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">Start with 20% free access. Unlock the remaining 80% for focused interview preparation.</p>
        </div>
      </div>

      <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Included</p>
          <div className="mt-5 space-y-4">
            {[
              "Full published DSA problem library",
              "Company-wise interview preparation",
              "Hints, editorials and premium solutions",
              "Starter code and judge-ready problem data",
              "Progress tracking and premium access for 30 days",
            ].map((item) => <div key={item} className="flex items-start gap-3"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Check className="h-3.5 w-3.5" /></span><p className="text-sm font-bold leading-6 text-slate-700">{item}</p></div>)}
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
          <div className="flex items-center gap-2 text-xs font-black text-blue-700"><Sparkles className="h-4 w-4" /> Monthly access</div>
          <div className="mt-4 flex items-end gap-2"><span className="text-4xl font-black text-slate-950">₹{subscription?.price || 299}</span><span className="pb-1 text-xs font-bold text-slate-500">/ 30 days</span></div>
          <button type="button" disabled={paying} onClick={handleUnlock} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-black text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{paying ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}{paying ? "Opening secure checkout…" : "Unlock All DSA"}</button>
          <p className="mt-3 text-center text-[11px] font-bold leading-5 text-slate-500">Secure payment powered by Razorpay. Premium access activates only after server-side verification.</p>
        </div>
      </div>

      {(error || message) && <div className={`mx-6 mb-6 rounded-xl px-4 py-3 text-xs font-bold sm:mx-10 ${error ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{error || message}</div>}

      {error?.toLowerCase().includes("login") && <div className="px-6 pb-8 text-center sm:px-10"><a href={`${MAIN_APP_URL}/login?redirect=/dsa/unlock`} className="text-sm font-black text-blue-600 hover:text-blue-700">Go to ApnaAcademy Login →</a></div>}
    </div>
  </section>;
}
