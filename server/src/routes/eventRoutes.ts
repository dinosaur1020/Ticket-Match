import { Router } from 'express';
import * as eventController from '../controllers/eventController';

const router = Router();

router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventDetails);

export default router;

