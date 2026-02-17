import { Router } from "express";
import {
    completeDeliveryController,
    reportExceptionController,
    startDeliveryController
} from "../controllers/delivery.controller";
import { validate } from "../middlewares/validation.middleware";
import {
    proofSchema,
    exceptionSchema
} from "../validators/delivery.validator";
import { protect } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { UserRole } from "../constants/roles";

const router = Router();

router.post(
    "/:shipmentId/start",
    protect,
    authorize(UserRole.DRIVER, UserRole.WAREHOUSE_MANAGER, UserRole.ADMIN),
    startDeliveryController
);

router.patch(
    "/:shipmentId/complete",
    protect,
    authorize(UserRole.DRIVER, UserRole.WAREHOUSE_MANAGER, UserRole.ADMIN),
    validate(proofSchema),
    completeDeliveryController
);

router.patch(
    "/:shipmentId/report-exception",
    protect,
    authorize(UserRole.DRIVER, UserRole.WAREHOUSE_MANAGER, UserRole.DISPATCHER, UserRole.ADMIN),
    validate(exceptionSchema),
    reportExceptionController
);


export default router;
