import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";
import { Request } from "express";

interface CloudinaryStorageParams {
  folder: string;
  format: (req: Request, file: Express.Multer.File) => Promise<string> | string;
  public_id: (req: Request, file: Express.Multer.File) => string;
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    format: async (req: Request, file: Express.Multer.File) => "png",
    public_id: (req: Request, file: Express.Multer.File) => file.originalname.split(".")[0],
  } as CloudinaryStorageParams,
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export default upload;
