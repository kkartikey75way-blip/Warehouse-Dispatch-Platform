import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { UserRole } from '../constants/roles';
import * as trackingController from '../controllers/tracking.controller';

const router = Router();

// All routes require authentication
router.use(protect);

// Driver updates location
router.post(
    '/location',
    authorize(UserRole.DRIVER),
    trackingController.updateLocation
);

// Update shipment status (Manager/Admin)
router.patch(
    '/status/:shipmentId',
    authorize(UserRole.WAREHOUSE_MANAGER, UserRole.ADMIN),
    trackingController.updateStatus
);

// Get tracking information (All authenticated users)
router.get(
    '/:shipmentId',
    trackingController.getTracking
);

export default router;
