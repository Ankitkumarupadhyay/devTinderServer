// utils/uploadToCloudinary.js
const cloudinary = require("./cloudinary");
const fs = require("fs");

const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder || "uploads",
    });

    // Remove file from local storage after upload
    fs.unlinkSync(filePath);

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = uploadToCloudinary;
