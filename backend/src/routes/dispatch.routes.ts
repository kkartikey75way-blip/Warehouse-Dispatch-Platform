import { Router } from "express";
import { autoAssignDispatchController, getDispatchesController, exportManifestController, assignBatchController } from "../controllers/dispatch.controller";
import { groupShipmentsController } from "../controllers/route.controller";
import { protect } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { UserRole } from "../constants/roles";

const router = Router();

router.get(
    "/",
    protect,
    authorize(UserRole.WAREHOUSE_MANAGER, UserRole.DISPATCHER, UserRole.ADMIN),
    getDispatchesController
);

router.post(
    "/batch",
    protect,
    authorize(UserRole.WAREHOUSE_MANAGER, UserRole.DISPATCHER, UserRole.ADMIN),
    groupShipmentsController
);

router.get(
    "/export",
    protect,
    authorize(UserRole.WAREHOUSE_MANAGER, UserRole.DISPATCHER, UserRole.ADMIN),
    exportManifestController
);

router.post(
    "/auto-assign",
    protect,
    authorize(UserRole.WAREHOUSE_MANAGER, UserRole.DISPATCHER, UserRole.ADMIN),
    autoAssignDispatchController
);

router.post(
    "/assign-batch",
    protect,
    authorize(UserRole.WAREHOUSE_MANAGER, UserRole.DISPATCHER, UserRole.ADMIN),
    assignBatchController
);

export default router;
