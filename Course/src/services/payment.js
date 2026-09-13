import api from "./api";

const RAZORPAY_CHECKOUT_URL =
  "https://checkout.razorpay.com/v1/checkout.js";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      `script[src="${RAZORPAY_CHECKOUT_URL}"]`
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const createPaymentOrder = async (
  courseId,
  purchaseType = "course"
) => {
  const response = await api.post("/payments/create-order", {
    courseId,
    purchaseType,
  });

  return response.data;
};

export const verifyPayment = async ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const response = await api.post("/payments/verify", {
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
  });

  return response.data;
};

export const startCoursePayment = async ({
  courseId,
  courseTitle,
  purchaseType = "course",
  user,
  onSuccess,
  onFailure,
}) => {
  let settled = false;

  const fail = (payload) => {
    if (settled) return;
    settled = true;
    onFailure?.(payload);
  };

  try {
    const loaded = await loadRazorpayScript();

    if (!loaded) {
      throw new Error(
        "Razorpay Checkout could not be loaded. Please check your internet connection."
      );
    }

    const response = await createPaymentOrder(
      courseId,
      purchaseType
    );

    if (!response?.success) {
      throw new Error(
        response?.message || "Unable to create payment order."
      );
    }

    const orderData = response?.data || response;

    const {
      orderId,
      amount,
      currency,
      keyId,
    } = orderData;

    if (!orderId || !amount || !currency || !keyId) {
      throw new Error(
        "Payment order response is incomplete. Please try again."
      );
    }

    const razorpay = new window.Razorpay({
      key: keyId,
      amount,
      currency,
      name: "ApnaAcademy",
      description:
        purchaseType === "all-access"
          ? `${courseTitle} - All Modules Unlock`
          : courseTitle,
      order_id: orderId,
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.phone || "",
      },
      theme: {
        color: "#2563eb",
      },
      modal: {
        ondismiss: () => {
          fail({
            type: "dismissed",
            message: "Payment window was closed.",
          });
        },
      },
      handler: async (paymentResponse) => {
        if (settled) return;

        try {
          const verificationResponse =
            await verifyPayment({
              razorpayOrderId:
                paymentResponse.razorpay_order_id,
              razorpayPaymentId:
                paymentResponse.razorpay_payment_id,
              razorpaySignature:
                paymentResponse.razorpay_signature,
            });

          if (!verificationResponse?.success) {
            throw new Error(
              verificationResponse?.message ||
                "Payment verification failed."
            );
          }

          if (settled) return;
          settled = true;
          onSuccess?.(verificationResponse);
        } catch (error) {
          fail({
            type: "verification",
            message:
              error?.response?.data?.message ||
              error?.message ||
              "Payment verification failed.",
          });
        }
      },
    });

    razorpay.on("payment.failed", (responseData) => {
      fail({
        type: "payment",
        message:
          responseData?.error?.description ||
          "Payment failed. Please try again.",
      });
    });

    razorpay.open();
  } catch (error) {
    fail({
      type: "order",
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Unable to start payment.",
    });
  }
};