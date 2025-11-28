import { Router } from 'express';
import * as tradeController from '../controllers/tradeController';

const router = Router();

router.post('/', tradeController.createTrade);
router.post('/:trade_id/confirm', tradeController.confirmTrade);
router.get('/user/:user_id', tradeController.getTradeHistory);
router.get('/:trade_id', tradeController.getTradeDetails);

export default router;

