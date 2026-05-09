import { Request, Response, NextFunction } from "express";

export const adminAuth = (req: Request, res: Response, next: NextFunction): void => {
  console.log("Verifing admin");
  const token = "xyz";
  const isAdminAuthorised = token === "xyz";
  if (!isAdminAuthorised) {
    res.status(401).send("Admin not verified");
  } else {
    next();
  }
};
