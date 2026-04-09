import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ApiError } from '../utils/ApiError';

const storage = multer.memoryStorage();

const documentFilter = (req: any, file: any, cb: any) => {
  const allowedExtensions = ['.pdf', '.epub', '.mobi'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only PDF, EPUB, and MOBI files are allowed'), false);
  }
};

const imageFilter = (req: any, file: any, cb: any) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only JPG, JPEG, PNG, and WEBP images are allowed'), false);
  }
};

export const uploadDocument = multer({
  storage: storage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

export const uploadImage = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for images
  },
});
