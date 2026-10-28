import { Router } from 'express';
import { recommendSchemes, recommendFarmerSchemes, getAllSchemes, simulateSchemes, saveSchemeRecommendations, getSavedSchemeRecommendations } from '../controllers/schemeController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/recommend', authenticate, recommendSchemes);
router.get('/recommend/farmer', authenticate, recommendFarmerSchemes);
router.post('/recommendations', authenticate, saveSchemeRecommendations);
router.get('/recommendations', authenticate, getSavedSchemeRecommendations);
router.post('/simulate', authenticate, simulateSchemes);
router.get('/', authenticate, getAllSchemes);

export default router;
