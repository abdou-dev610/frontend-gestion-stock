export const notFoundMiddleware = (req, res, next) => {
  res.status(404);
  next(new Error(`Route non trouvée: ${req.originalUrl}`));
};
