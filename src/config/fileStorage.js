import multer from 'multer';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'files');

function generateUniqueFileName(originalName) {
    return btoa(`${Date.now()}-${originalName}`);
}

if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
}

export const topicDescriptionStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, filePath);
    },
    filename: (req, file, cb) => {
        cb(null, generateUniqueFileName(file.originalname));
    }
});
