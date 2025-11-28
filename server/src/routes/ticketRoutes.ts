import { Router } from 'express';
import * as ticketController from '../controllers/ticketController';

const router = Router();

router.post('/', ticketController.createTicket);
router.get('/user/:user_id', ticketController.getMyTickets);
router.get('/listing/:listing_id', ticketController.getTicketsByListing);

export default router;
