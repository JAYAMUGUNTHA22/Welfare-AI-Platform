import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  addBenefitPayment,
  cancelPendingApplication,
  confirmApplication,
  getMyApplications,
  reserveOfflineApplication,
  startApplication,
} from '../controllers/applicationController.js';

const router = Router();

router.use(authenticate);
router.get('/', getMyApplications);
router.post('/start', startApplication);
router.post('/offline', reserveOfflineApplication);
router.post('/:id/confirm', confirmApplication);
router.post('/:id/cancel', cancelPendingApplication);
router.post('/:id/payments', addBenefitPayment);

export default router;
