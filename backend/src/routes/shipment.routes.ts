import { Router } from "express";
import {
    createShipmentController,
    updateShipmentStatusController,
    getShipmentsController,
    acceptShipmentController,
    exportShipmentsController
} from "../controllers/shipment.controller";
import { validate } from "../middlewares/validation.middleware";
import {
    createShipmentSchema,
    updateStatusSchema
} from "../validators/shipment.validator";
import { protect } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { authRateLimiter } from "../middlewares/rateLimit.middleware";
import { UserRole } from "../constants/roles";

const router = Router();

router.get("/", protect, getShipmentsController);

router.post(
    "/",
    protect,
    authorize(UserRole.WAREHOUSE_MANAGER, UserRole.ADMIN),
    authRateLimiter,
    validate(createShipmentSchema),
    createShipmentController
);

router.get(
    "/export",
    protect,
    authorize(UserRole.WAREHOUSE_MANAGER, UserRole.DISPATCHER, UserRole.ADMIN),
    exportShipmentsController
);

router.patch(
    "/:id/status",
    protect,
    authorize(UserRole.WAREHOUSE_MANAGER, UserRole.DISPATCHER, UserRole.ADMIN),
    authRateLimiter,
    validate(updateStatusSchema),
    updateShipmentStatusController
);

router.patch(
    "/:shipmentId/accept",
    protect,
    authorize(UserRole.DRIVER),
    acceptShipmentController
);

export default router;
