import { Router } from 'express';
import { compareTrade, getTradeHistory, getCooldownStatus } from '../controllers/tradeController';
import { authenticate, checkTradeCooldown } from '../middleware/auth';

const router = Router();

// All trade routes require authentication
router.post('/compare', authenticate, checkTradeCooldown, compareTrade);
router.get('/history', authenticate, getTradeHistory);
router.get('/cooldown', authenticate, getCooldownStatus);

export default router;
