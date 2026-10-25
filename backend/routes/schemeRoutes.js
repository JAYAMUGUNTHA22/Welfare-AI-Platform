import { Router } from 'express';
import { recommendSchemes, getAllSchemes, simulateSchemes, saveSchemeRecommendations } from '../controllers/schemeController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/recommend', authenticate, recommendSchemes);
router.post('/recommendations', authenticate, saveSchemeRecommendations);
router.post('/simulate', authenticate, simulateSchemes);
router.get('/', authenticate, getAllSchemes);

export default router;
