import { Request } from "express";
import { IUserDocument } from "../models/user";

export interface CustomRequest extends Request {
  user?: IUserDocument;
}
