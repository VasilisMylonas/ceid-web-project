import multer from "multer";
import fs from "fs";
import path from "path";
import process from "process";

export const fileLocation = path.join(process.cwd(), "files");

export function getFilePath(fileName) {
  return path.join(fileLocation, fileName);
}

export function deleteIfExists(fileName) {
  if (!fileName) {
    return;
  }

  const filePath = getFilePath(fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export const fileStorage = multer.diskStorage({
  destination(req, file, cb) {
    if (!fs.existsSync(fileLocation)) {
      console.info("Creating file storage directory:", fileLocation);
      fs.mkdirSync(fileLocation);
    }
    cb(null, fileLocation);
  },
  filename(req, file, cb) {
    const filename = `${Date.now()}${path.extname(file.originalname)}`;
    console.info(`Saving uploaded file as ${filename}`);
    cb(null, filename);
  },
});
