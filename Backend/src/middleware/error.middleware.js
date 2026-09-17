export const errorMiddleware = (
  error,
  req,
  res,
  next
) => {
  if (res.headersSent) {
    return next(error);
  }

  const message = String(error?.message || "");
  const databaseUnavailable =
    error?.name === "MongoNotConnectedError" ||
    error?.name === "MongoServerSelectionError" ||
    /buffering timed out|before initial connection|topology was destroyed|client must be connected/i.test(message);

  const statusCode = error.statusCode || (databaseUnavailable ? 503 : 500);
  const responseMessage = databaseUnavailable
    ? "Database temporarily unavailable. Please retry."
    : message || "Internal server error.";

  if (statusCode >= 500) {
    console.error("❌ API Error:", error);
  } else {
    console.warn("⚠️ API Error:", responseMessage);
  }

  return res.status(statusCode).json({
    success: false,
    message: responseMessage,
    ...(error.errors && {
      errors: error.errors,
    }),
    ...(process.env.NODE_ENV !== "production" && {
      stack: error.stack,
    }),
  });
};
