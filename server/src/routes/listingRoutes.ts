import { Router } from 'express';
import * as listingController from '../controllers/listingController';

const router = Router();

router.get('/', listingController.getListings);
router.post('/', listingController.createListing);

export default router;

