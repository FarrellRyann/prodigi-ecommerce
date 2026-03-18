import * as fs from 'node:fs';
import * as path from 'node:path';

const multer = require('multer') as typeof import('multer');

const uploadsDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const imageFileFilter = (
  _req: import('express').Request,
  file: Express.Multer.File,
  cb: import('multer').FileFilterCallback
) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Only image files are allowed.'));
    return;
  }

  cb(null, true);
};

const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

module.exports = { uploadImage, uploadsDir };

export {};
