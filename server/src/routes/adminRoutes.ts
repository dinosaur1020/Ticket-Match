import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// All admin routes require admin authentication
router.use(requireAdmin);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.put('/users/:userId/roles', adminController.updateUserRole);
router.put('/users/:userId/status', adminController.updateUserStatus);

// Listing management
router.get('/listings', adminController.getAllListings);
router.put('/listings/:listingId', adminController.updateListing);
router.delete('/listings/:listingId', adminController.deleteListing);

// Event management
router.post('/events', adminController.createEvent);
router.delete('/events/:eventId', adminController.deleteEvent);

export default router;