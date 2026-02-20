import { Router } from "express";
import {
    getWarehousesController,
    createWarehouseController,
    findReturnWarehouseController,
    warehouseHeartbeatController,
    markOfflineController,
    detectConflictsController,
    reconcileConflictController
} from "../controllers/warehouse.controller";

const router = Router();

router.get("/", getWarehousesController);
router.post("/", createWarehouseController);
router.get("/return-routing", findReturnWarehouseController);
router.get("/conflicts", detectConflictsController);
router.post("/conflicts/reconcile", reconcileConflictController);
router.post("/:code/heartbeat", warehouseHeartbeatController);
router.post("/:code/offline", markOfflineController);

export default router;
