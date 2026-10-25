import { Router } from 'express';
import { register, login, getMe, verifyDocumentPassword, lockDocumentAccess } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.post('/verify-password', authenticate, verifyDocumentPassword);
router.delete('/document-access', authenticate, lockDocumentAccess);

export default router;
