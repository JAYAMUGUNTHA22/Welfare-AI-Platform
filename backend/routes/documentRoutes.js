import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, requireDocumentVerification } from '../middleware/auth.js';
import {
  getUserDocuments,
  uploadDocument,
  getDocumentFile,
  updateDocument,
  deleteDocument,
  extractDocumentData,
  getExtractedProfile,
} from '../controllers/documentController.js';

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    cb(null, `doc-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only PDF, JPG, and PNG files are allowed.'));
    }
  },
});

const router = Router();

router.use(authenticate, requireDocumentVerification);

router.get('/',                 getUserDocuments);
router.post('/',                upload.single('file'), uploadDocument);
router.get('/extracted-profile', getExtractedProfile);
router.get('/:id/file',         getDocumentFile);
router.post('/:id/extract',     extractDocumentData);
router.put('/:id',              upload.single('file'), updateDocument);
router.delete('/:id',           deleteDocument);

export default router;
