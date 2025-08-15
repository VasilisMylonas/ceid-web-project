import multer from "multer";
import fs from "fs";
import path from "path";

export const fileLocation = path.join(process.cwd(), "files");

function generateUniqueFileName(originalName) {
  return btoa(`${Date.now()}-${originalName}`);
}

export function getFilePath(fileName) {
  return path.join(fileLocation, fileName);
}

export function deleteIfExists(fileName) {
  const filePath = getFilePath(fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(fileLocation)) {
      fs.mkdirSync(fileLocation);
    }
    cb(null, fileLocation);
  },
  filename: (req, file, cb) => {
    cb(null, generateUniqueFileName(file.originalname));
  },
});
