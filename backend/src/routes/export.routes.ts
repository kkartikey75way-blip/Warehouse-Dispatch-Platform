import { Router } from "express";
import { exportDispatchManifestController, exportDeliveryReportController } from "../controllers/export.controller";
import { protect } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { UserRole } from "../constants/roles";
import { authRateLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

router.get(
    "/dispatch-manifest",
    protect,
    authorize(UserRole.WAREHOUSE_MANAGER, UserRole.ADMIN, UserRole.DISPATCHER),
    authRateLimiter,
    exportDispatchManifestController
);

router.get(
    "/delivery-report",
    protect,
    authorize(UserRole.WAREHOUSE_MANAGER, UserRole.ADMIN, UserRole.DISPATCHER),
    authRateLimiter,
    exportDeliveryReportController
);

export default router;
