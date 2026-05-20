export const errorMiddleware = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Erreur serveur interne",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
