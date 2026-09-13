import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Avatar,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import dashboardService from "../services/dashboard.service";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatCurrency = (amount, currency = "INR") => {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return "—";

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    return `${currency} ${numericAmount}`;
  }
};

const getPurchaseTitle = (purchase) =>
  purchase?.course?.title || purchase?.courseTitle || "Course Purchase";

const getPurchaseThumbnail = (purchase) =>
  purchase?.course?.thumbnail || purchase?.thumbnail || "";

const getPurchaseTypeLabel = (purchase) => {
  if (purchase?.unlockMode === "all") return "All Access";
  if (purchase?.purchaseType === "course") return "Course Access";
  return purchase?.purchaseType || "Purchase";
};

const getStatus = (purchase) => {
  if (purchase?.paymentStatus !== "paid") {
    return {
      label: purchase?.paymentStatus || "Pending",
      color: "warning",
      icon: <ScheduleIcon fontSize="small" />,
    };
  }

  if (purchase?.expiresAt) {
    const expiry = new Date(purchase.expiresAt);
    if (!Number.isNaN(expiry.getTime()) && expiry < new Date()) {
      return {
        label: "Expired",
        color: "default",
        icon: <ScheduleIcon fontSize="small" />,
      };
    }
  }

  return {
    label: "Paid",
    color: "success",
    icon: <CheckCircleIcon fontSize="small" />,
  };
};

function PurchaseCard({ purchase }) {
  const title = getPurchaseTitle(purchase);
  const thumbnail = getPurchaseThumbnail(purchase);
  const status = getStatus(purchase);

  return (
    <Paper
      elevation={0}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex flex-col sm:flex-row">
        <div className="h-44 w-full shrink-0 bg-slate-100 sm:h-auto sm:w-52">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full min-h-44 items-center justify-center bg-blue-50 text-blue-600">
              <ShoppingBagIcon sx={{ fontSize: 48 }} />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between p-5 sm:p-6">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <Typography
                  component="h2"
                  className="truncate text-lg font-bold text-slate-900 sm:text-xl"
                >
                  {title}
                </Typography>

                <div className="mt-2 flex flex-wrap gap-2">
                  <Chip
                    size="small"
                    label={getPurchaseTypeLabel(purchase)}
                    className="font-medium"
                  />
                  <Chip
                    size="small"
                    icon={status.icon}
                    label={status.label}
                    color={status.color}
                    variant="outlined"
                    className="font-medium"
                  />
                </div>
              </div>

              <Typography className="whitespace-nowrap text-lg font-bold text-blue-700">
                {formatCurrency(purchase?.amount, purchase?.currency || "INR")}
              </Typography>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <CalendarMonthIcon fontSize="small" />
                  <span>Purchased</span>
                </div>
                <p className="mt-1 font-semibold text-slate-800">
                  {formatDate(purchase?.purchasedAt || purchase?.createdAt)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <ScheduleIcon fontSize="small" />
                  <span>Expires</span>
                </div>
                <p className="mt-1 font-semibold text-slate-800">
                  {formatDate(purchase?.expiresAt)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 text-slate-500">
                  <ReceiptLongIcon fontSize="small" />
                  <span>Order ID</span>
                </div>
                <p className="mt-1 truncate font-semibold text-slate-800">
                  {purchase?.razorpayOrderId || purchase?.orderId || "—"}
                </p>
              </div>
            </div>
          </div>

          {(purchase?.razorpayPaymentId || purchase?.paymentId) && (
            <div className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
              Payment ID: {purchase?.razorpayPaymentId || purchase?.paymentId}
            </div>
          )}
        </div>
      </div>
    </Paper>
  );
}

export default function Purchases() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPurchases = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await dashboardService.getDashboard();
      setDashboard(data);
    } catch (err) {
      console.error("Failed to load purchases:", err);
      setError(
        err?.response?.data?.message ||
          "Unable to load your purchase history. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  const purchases = useMemo(() => {
    const list = dashboard?.recentPurchases;
    return Array.isArray(list) ? list : [];
  }, [dashboard]);

  const paidCount = purchases.filter(
    (purchase) => purchase?.paymentStatus === "paid"
  ).length;

  return (
    <div className="min-h-full bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Avatar className="bg-blue-50 text-blue-700">
                <ShoppingBagIcon />
              </Avatar>
              <div>
                <Typography
                  component="h1"
                  className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
                >
                  Purchases
                </Typography>
                <Typography className="mt-1 text-sm text-slate-500 sm:text-base">
                  View your course purchases and payment details.
                </Typography>
              </div>
            </div>
          </div>

          {!loading && !error && purchases.length > 0 && (
            <div className="flex gap-2">
              <Chip label={`${purchases.length} total`} variant="outlined" />
              <Chip label={`${paidCount} paid`} color="success" variant="outlined" />
            </div>
          )}
        </div>

        {loading && (
          <div className="flex min-h-80 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <Stack alignItems="center" spacing={2}>
              <CircularProgress size={34} />
              <Typography className="text-sm text-slate-500">
                Loading purchase history...
              </Typography>
            </Stack>
          </div>
        )}

        {!loading && error && (
          <Alert
            severity="error"
            action={
              <button
                type="button"
                onClick={loadPurchases}
                className="font-semibold text-red-700 hover:underline"
              >
                Retry
              </button>
            }
            className="rounded-2xl"
          >
            {error}
          </Alert>
        )}

        {!loading && !error && purchases.length === 0 && (
          <Paper
            elevation={0}
            className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center"
          >
            <Avatar className="mb-4 h-16 w-16 bg-blue-50 text-blue-700">
              <ShoppingBagIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Typography className="text-xl font-bold text-slate-900">
              No purchases yet
            </Typography>
            <Typography className="mt-2 max-w-md text-sm text-slate-500">
              Your completed course purchases will appear here once you enroll in a course.
            </Typography>
          </Paper>
        )}

        {!loading && !error && purchases.length > 0 && (
          <div className="space-y-4">
            {purchases.map((purchase, index) => (
              <PurchaseCard
                key={
                  purchase?.id ||
                  purchase?._id ||
                  purchase?.razorpayOrderId ||
                  `purchase-${index}`
                }
                purchase={purchase}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
