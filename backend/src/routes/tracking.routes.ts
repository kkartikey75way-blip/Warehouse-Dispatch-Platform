import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { UserRole } from '../constants/roles';
import * as trackingController from '../controllers/tracking.controller';

const router = Router();


router.use(protect);


router.post(
    '/location',
    authorize(UserRole.DRIVER),
    trackingController.updateLocation
);


router.patch(
    '/status/:shipmentId',
    authorize(UserRole.WAREHOUSE_MANAGER, UserRole.ADMIN),
    trackingController.updateStatus
);


router.get(
    '/:shipmentId',
    trackingController.getTracking
);

export default router;
