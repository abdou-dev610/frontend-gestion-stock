import mongoose from "mongoose";

export const validateObjectId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400);
    return next(new Error("Identifiant invalide"));
  }
  next();
};
