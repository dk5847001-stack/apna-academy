export const errorMiddleware = (
  error,
  req,
  res,
  next
) => {
  console.error("❌ API Error:", error);

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      error.message || "Internal server error.",
    ...(error.errors && {
      errors: error.errors,
    }),
    ...(process.env.NODE_ENV !== "production" && {
      stack: error.stack,
    }),
  });
};